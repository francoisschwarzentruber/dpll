;scheme.eval("(formula-check-syntax '(bigand c (Red Blue Green Yellow) ((not (France c)) or (not (Germany c)))))")
;scheme.eval("(formula-check-syntax 'p)")
;scheme.eval("(formula-check-syntax '((p or (not t)) or (q or t) and t))")
(define (formula-check-syntax phi)
  (match phi
    (('bigand i s condition psi)
     (+ (if (list? i) "After bigand, there should be an identifier. " "")  (formula-check-syntax psi)))
    (('bigor i s condition psi)
     (+ (if (list? i) "After bigand, there should be an identifier. " "")  (formula-check-syntax psi)))
    (('bigand i s psi)
     (+ (if (list? i) "After bigand, there should be an identifier. " "")  (formula-check-syntax psi)))
    (('bigor i s psi)
     (+ (if (list? i) "After bigand, there should be an identifier. " "")  (formula-check-syntax psi)))
    (('bigxor i s psi)
	  (+ (if (list? i) "After bigand, there should be an identifier. " "")  (formula-check-syntax psi)))
    ((phi 'and psi)
     (+ (formula-check-syntax phi) (formula-check-syntax psi)))
    
    ((phi 'or psi)
     (+ (formula-check-syntax phi) (formula-check-syntax psi)))
    
    ((phi 'xor psi)
     (+ (formula-check-syntax phi) (formula-check-syntax psi)))
    
    ((phi 'imply psi)
      (+ (formula-check-syntax phi) (formula-check-syntax psi)))
    
    ((phi 'equiv psi)
      (+ (formula-check-syntax phi) (formula-check-syntax psi)))
    
    
    (('not phi)
     (formula-check-syntax phi))
    (a
     (if (list? a)
         (if (null? a)
             "La construction () n'est pas licite."
             (if (null? (cdr a))
                 "Une construction comme (phi) n'est pas licite. On ne doit pas surparenthéser des formules."
		  (if (formula-and-at-second-position? a)
		    (formula-check-syntax-and a)
		    (if (formula-or-at-second-position? a)
			(formula-check-syntax-or a)
			(check-contains-no-connectors a)))))
              (check-is-not-connector a)      
	      ))))


  
  
  
;(formula-or-at-second-position? '(p and q and r))
(define (formula-or-at-second-position? l)
  (if (list? l)
	(if (equal? (cadr l) 'or)
		#t
		#f)
	#f))

;(formula-and-at-second-position? '(p and q and r))
(define (formula-and-at-second-position? l)
  (if (list? l)
	(if (equal? (cadr l) 'and)
		#t
		#f)
	#f))


;(andByTwo '(a and b and c))
;(andByTwo '((r i) and (not (a i)) and (not (b i)) ))
(define (formula-check-syntax-and l)
  (if (null? (cdr l))
      ""
      (if (not (equal? (cadr l) 'and))
          "Il faut un and pour continuer la conjonction."
          (+ (formula-check-syntax (car l)) (formula-check-syntax-and (cddr l))))))


;(andByTwo '(a and b and c))
;(andByTwo '((r i) and (not (a i)) and (not (b i)) ))
(define (formula-check-syntax-or l)
  (if (null? (cdr l))
      ""
      (if (not (equal? (cadr l) 'or))
          "Il faut un or pour continuer la disjonction."
          (+ (formula-check-syntax (car l)) (formula-check-syntax-or (cddr l))))))
  

  
  
  
  
 (define (check-contains-no-connectors a)
  (if (list? a)
       (if (null? a)
                 ""
                 (+ (check-contains-no-connectors (car a)) (check-contains-no-connectors (cdr a))))
       (check-is-not-connector a)))
  
  
  
  
 ;scheme.eval("(check-is-not-connector 'or)")
(define (check-is-not-connector a)
       (if (contains? a '(and or bigand bigor bigxor))
              "Il y a un connecteur qui n'est pas à la bonne place. On exige ici que les constructions sont toutes parenthésées. Par exemple 'p or q' n'est pas correct mais '(p or q)' l'est."
              ""))
