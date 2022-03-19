/*
 * sat.js
 * (C) 2012, all rights reserved,
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * DESCRIPTION:
 *     This is a SAT solver implemented in javascript.
 */

/***********************************************************
 * State constructor.
 **********************************************************/
function State() {
    this.empty = false; // is true when we have the empty (contradiction) in clauses

    this.vars = [null]; //array of variables (null is present because this.vars[0] should never be accessed as variable indexes should >= 1)
    this.clauses = []; //the set of clauses we want to satisfy (it is possibly extended when we add learning clauses)
    this.trail = []; //array of literals
    this.dlevel = 0; //decision level
    this.tlevel = 0; // trail level?!?! = number of elements in the trail
}











/************************************************************
 * Variable constructor.
 ***********************************************************/
function Variable() {
    this.isvariableset = false; //true iff the value of the variable is set
    this.sign = false; //the sign of the variable (if the variable is set)
    this.mark = false;
    this.unit = false; // true iff the variable is assigned
    this.unit_sign = false; // is the sign of the variable iff the variable is assigned (otherwise, this field is not relevant)
    this.dlevel = 0; //the decision level when the variable was set
    this.reason = null; //the reason why the variable has been set


    /*
        this.watches[0] contains clauses such that the variable appears positively
        this.watches[1] contains clauses such that the variable appears negatively
        
        Furthermore, if this corresponds to variable i, then 
              this.watches[0][j] is a clause and either this.watches[0][j][0] = i or this.watches[0][j][1] = i.
              
        Furthermore, if this corresponds to variable i, then 
              this.watches[1][j] is a clause and either this.watches[1][j][0] = -i or this.watches[1][j][1] = -i.
    */
    this.watches = [
        [],
        []
    ];

    /*says that the variable is affected to sign by the direct presence of a clause of size 1 (such clauses are not treated in the same way because of watches)*/
    this.setUnit = function (sign) {
        this.unit = true;
        this.unit_sign = sign;
    }
}










/**********************************************************************************
 * Literal helper functions.
 **********************************************************************************/

/*
	input: literal, a non-zero integer
	output:  the positive number representing the atomic proposition of the literal (it is the absolute value)
*/
function literalGetIdx(literal) {
    return (literal < 0 ? -literal : literal);
}

/*
	input: literal, a non-zero integer
	output: returns true iff the literal is negative
*/
function literalGetSign(literal) {
    return (literal < 0);
}


/*
	input: literal, a non-zero integer
	output: the variable that corresponds to the literal
*/
function literalGetVar(state, literal) {
    const idx = literalGetIdx(literal);
    return state.vars[idx];
}

/*
	input: state, literal
	output: returns true iff the variable of the litteral is set in the state AND it is set so that the literal is false
*/
function literalIsFalse(state, literal) {
    const v = literalGetVar(state, literal);
    return (v.isvariableset && v.sign != literalGetSign(literal));
}

/**
 * 
 * @param {*} state 
 * @param {*} literal 
 * @returns true if the variable corresponding to the literal is marked
 */
function literalGetMark(state, literal) {
    const v = literalGetVar(state, literal);
    return v.mark;
}



/*
	input: 	state
		literal
		clause

		such that the literal appears in the clause

	output: nothing

	effect: add the clause in the watch list in the variable corresponding to the literal

*/
function literalAddWatch(state, literal, clause) {
    const v = literalGetVar(state, literal);
    const watch = v.watches[Number(literalGetSign(literal))]; //Number(false) = 0, Number(true) = 1

    //watch is either v.watches[0] or v.watches[1]
    watch.push(clause);
}





/*
input:
	- state
	- literal
	- reason

effect:
	declare the literal true in state
*/
function literalSet(state, literal, reason) {
    const v = literalGetVar(state, literal);
    v.sign = literalGetSign(literal);
    v.isvariableset = true;
    v.dlevel = state.dlevel;
    v.reason = reason;

    state.trail.push(literal);
    UIDPLL_literalSet(state, literal, reason);
}





/*
 * Add the clause clause to the state state
 *	input: 	state
		clause is an array of non-zero integers (if an integer is negative, it represents a negative litteral)
    @example satAddClause(state, [-2, 3, 9])
 * 	Effect: it modifies the object state
 */
function satAddClause(state, clause) {
    state.clauses.push(clause);
    switch (clause.length) {
        case 0: // Empty clause (i.e. bottom)
            state.empty = true;
            return;
        case 1:
            const v = literalGetVar(state, clause[0]);
            const sign = literalGetSign(clause[0]);

            if (v === undefined) {
                alert(state);
                alert(clause[0]);
            }
            if (v.unit) {
                if (sign != v.unit_sign)
                    state.empty = true;
                return;
            }
            v.setUnit(sign);
            return;

        default:
            literalAddWatch(state, clause[0], clause);
            literalAddWatch(state, clause[1], clause);
    }
}










var arf;


/*
 * Select a literal.  Chooses a literal at random (provided not already set).
    
	input: state
	output: 0 if all variables are set in state
		a non-zero integer (negative or positive) representing a litteral that is not set in state.

 */
function satSelectLiteral(state) {
    if (state.listOfChosenLiteralsForSolver.length > 0) { // selections predefined by the user
        const literal = state.listOfChosenLiteralsForSolver.shift();
        return literal;
    }

    var M = 1;
    var N = state.vars.length - 1;
    var i = Math.floor(M + (1 + N - M) * Math.random());

    if (i >= state.vars.length)
        i = state.vars.length - 1;

    var i0 = i;
    if (state.vars[i] == undefined) /////////should not happen, can be removed/////
    {
        alert(i + " " + state.vars.length); /////////should not happen, can be removed///////
        arf = state;
    }

    while (state.vars[i].isvariableset) {
        i++;
        if (i >= state.vars.length)
            i = 1;
        if (i == i0)
            return 0;

        if (state.vars[i].isvariableset == undefined) ///should not happen, can be removed//////
            alert(i); /////should not happen, can be removed///////
    }

    return (Math.random() < 0.5 ? -i : i);
}





/*
 * Solver main loop.
 *
 * input: size: number of variables, clauses: the array representing the set of clauses
 *
 * output: false if UNSAT
 *         the current state if SAT.
              Note that we can extract a valuation satisfying the set of clauses from the returned state s as follows:
                  e.g. s.vars[2].sign is true iff the variable 2 is false
 *
eg. satSolve(3, [[3, 1, 2], [-3], [-2], [-1]])
 */
function satSolve(size, clauses, listOfChosenLiteralsForSolver) {
    if (size <= 0) {
        alert("Strange. satSolve is called with size = " + size);
        return false;
    }

    UIDPLL_init();

    // Create the initial state:
    var state = new State();
    state.listOfChosenLiteralsForSolver = listOfChosenLiteralsForSolver;

    //add the variables
    for (let i = 0; i < size; i++)
        state.vars.push(new Variable());

    //add the clauses
    for (let i = 0; i < clauses.length; i++)
        satAddClause(state, clauses[i]);

    // UNSAT if empty clause has been asserted:
    if (state.empty)
        return false;

    // Find and propagate unit clauses:
    for (var i = 1; i < state.vars.length; i++) {
        var v = state.vars[i];
        if (v.unit) {
            const literal = (v.unit_sign ? -i : i); //construct the literal from variable v and sign v.unit_sign
            if (!satUnitPropagate(state, literal, null))
                return false;
        }
    }

    /* Main loop: we decide (select) a litteral to be true
	state.dlevel corresponds to a level of decision. Each time, we may a new decision
	state.dlevel augments. It never decreases.
	*/
    for (state.dlevel = 1; true; state.dlevel++) {
        const literal = satSelectLiteral(state);

        if (literal == 0) // All variables are now set; and no conflicts; therefore SAT
            return state;

        UIDPLL_selectLiteral(state, literal);

        if (!satUnitPropagate(state, literal, null)) {
            // UNSAT
            return false;
        }
    }

    return state;
}

/**
 * input: state
          literal
          reason: can be null
   @returns false if it turns that the formula is unsatisfiable
            true otherwise
   effect: 
 * @description performs unit propagation by setting literal to true
 */
function satUnitPropagate(state, literal, reason) {

    var curr, next;
    let restart; //restart is true means that we redo a loop

    do {
        curr = state.trail.length;
        next = curr + 1;

        literalSet(state, literal, reason);

        restart = false;
        while (curr < next) {
            literal = state.trail[curr];
            curr++;
            literal = -literal; //from now on, literal has been put to false

            var v = literalGetVar(state, literal);
            var watch = v.watches[Number(literalGetSign(literal))];
            for (var i = 0; i < watch.length; i++) { //for all clauses watched by literal
                var clause = watch[i]; //clause contains literal, literal is either clause[0] or clause[1]

                var watch_idx = Number(clause[0] == literal);
                var watch_lit = clause[watch_idx]; // {watch_lit, literal} are the watched litterals (there are clause[0] and clause[1])
                var watch_sign = literalGetSign(watch_lit);
                var w = literalGetVar(state, watch_lit);
                if (w.isvariableset && w.sign == watch_sign) {
                    // 'clause' is true -- no work to do.
                    continue;
                }

                // Search for a non-false literal in 'clause'.
                let j;
                for (j = 2; j < clause.length && literalIsFalse(state, clause[j]); j++);

                //either (j >= clause.length), and except the watched literals, there are all false
                //or clause[j] is not false (either true or unassigned)

                if (j >= clause.length) { // except the other watched literal, all literals are false; use the other watch:
                    if (!w.isvariableset) {
                        // Implied set:
                        if (watch_idx != 0) {
                            clause[0] = watch_lit;
                            clause[1] = literal;
                        }

                        //the "other" literal is now clause[0] and is set to true, because of clause
                        literalSet(state, watch_lit, clause);
                        next++;
                        continue;
                    }

                    //w.isvariableset is set, but then the watch_lit is false.
                    //literal is also put to false
                    //HENCE: all literals in 'clause' are false; conflict!
                    UIDPLL_backtrack_before(state, clause);
                    reason = satBacktrack(state, clause);
                    UIDPLL_backtrack_after(state, clause, reason);

                    if (reason == null) // the backtrack gave no reason: the formula is unsat
                        return false;
                    literal = reason[0];
                    restart = true;
                    break;
                }

                // Watch the literal clause[j] which is non-false
                var new_lit = clause[j];

                //so swap literal and new_lit
                clause[Number(!watch_idx)] = new_lit;
                clause[j] = literal;

                //declare new_lit as watched in clause
                literalAddWatch(state, new_lit, clause);

                //undeclare literal as watched in clause = watch[i]
                if (i == watch.length - 1)
                    watch.pop();
                else {
                    watch[i] = watch.pop();
                    i--;
                }
            }

            if (restart)
                break;
        }
    }
    while (restart);

    return true;
}

/**
 * Backtracking and no-good learning.

	input: 	state
		reason: is a clause (an array of literals) that is unfortunately evaluated as false

	@returns the learned clause, or null if nothing to do

	effect: the trail of state is popped. The learned clause is added to the set of clauses

 */
function satBacktrack(state, reason) {
    let conflicts = [];

    // Level 0 failure; no work to do.
    if (state.dlevel == 0)
        return null;

    var count = 0;
    for (let i = 0; i < reason.length; i++) {
        const v = literalGetVar(state, reason[i]);
        if (v.dlevel == 0)
            continue;

        v.mark = true;
        if (v.dlevel < state.dlevel)
            conflicts.push(reason[i]);
        else
            count++;
    }
    // conflicts is the set of litterals of reason of decision level strictly smaller than the current one (but non 0)
    //count = number of literals in reason at the current level
    // literals of level > 0 that appears in the reason clause are marked

    // Find the UIP and collect conflicts:
    let tlevel = state.trail.length - 1;
    let literal;
    do {
        /*invariant:
         - count is the number of literals in the "current reason" at the current level
         - conflicts is the set of literals of decision level < current one in the "current reason"
         - marked nodes corresponds to the "current reason"
         
         variant:
         - we update the "current reason" if there is more than two literals at the current level in the "current reason"
              => we replace the last added literal that appears in the "current reason" by its antecedents
         */
        if (tlevel < 0)
            return null;
        literal = state.trail[tlevel--];
        var v = literalGetVar(state, literal);
        v.isvariableset = false;
        if (!v.mark)
            continue;
        v.mark = false;
        count--;
        if (count <= 0)
            break; //this is the only point where we quit the loop (*)
        for (let i = 1; i < v.reason.length; i++) {
            literal = v.reason[i];
            var w = literalGetVar(state, literal);
            if (w.mark || w.dlevel == 0)
                continue;
            if (w.dlevel < state.dlevel)
                conflicts.push(literal);
            else
                count++;
            w.mark = true;
        }
    }
    while (true);


    //Here: literal is the FUIP (that is the unique point at the current level in the "current reason")
    //conflicts contains the other literals of the "current reason" (that are of level < current level).

    // Simplify the conflicts; create the no-good.
    let nogood = [-literal];
    let blevel = 0; //backtrack level

    for (let i = 0; i < conflicts.length; i++) {
        const literal = conflicts[i];
        const v = literalGetVar(state, literal);
        if (v.reason != null) {
            var k;
            for (k = 1; k < v.reason.length &&
                literalGetMark(state, v.reason[k]); k++)
            ;
            if (k >= v.reason.length)
                continue;
        }
        nogood.push(literal);
        if (blevel < v.dlevel) {
            blevel = v.dlevel;
            nogood[nogood.length - 1] = nogood[1];
            nogood[1] = literal;
        }
    }

    //blevel is the backtrack level: it corresponds to the second max of the level of literals in the "current reason"

    // Unwind the trail until blevel (backtrack level):
    while (tlevel >= 0) {
        const literal = state.trail[tlevel];
        const v = literalGetVar(state, literal);
        if (v.dlevel <= blevel)
            break;
        v.isvariableset = false;
        tlevel--;
    }
    state.trail.length = tlevel + 1;

    // Clear the marks:
    for (let i = 0; i < conflicts.length; i++) {
        v = literalGetVar(state, conflicts[i]);
        v.mark = false;
    }

    // Add the no-good clause:
    satAddClause(state, nogood);
    state.dlevel = blevel;

    if (state.empty) {
        //means that we nogood is the empty clause??????????????????
        //does it happen?????????????????
        alert("state.empty " + nogood);
        return null;
    }

    return nogood;
}