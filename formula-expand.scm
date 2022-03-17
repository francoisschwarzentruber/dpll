;(condition-tester '(diff 1 2))
(define (condition-tester c)
  (match c
    ((a 'diff b)
         (diff a b))
    (a 12)))


;(suite 0 9)
(define (suite a b)
  (list-consecutive-integers-get a b))
  

;(calculer '(bigand i (1 .. 9) (p i)))
;(calculer '(bigand i (1 .. 9) (p (1 + 2))))
(define (calculer phi)
  (match phi 
    ((a '.. b) (suite a b))
	((i '+ j)
		(if (and (number? i) (number? j))
			(+ i j)
			(map calculer phi)))
	((i '- j)
		(if (and (number? i) (number? j))
			(- i j)
			(map calculer phi)))
	((i '* j)
		(if (and (number? i) (number? j))
			(* i j)
			(map calculer phi)))
	((i '/ j)
		(if (and (number? i) (number? j))
			(/ i j)
			(map calculer phi)))
    (a
     (if (list? a) (map calculer phi)
         a))))
  



;(formula-or-multi? '(p or q or r))
(define (formula-or-multi? l)
  (if (list? l)
	(if (= (cadr l) 'or)
		#t
		#f)
	#f))

;(formula-and-multi? '(p and q and r))
(define (formula-and-multi? l)
  (if (list? l)
	(if (= (cadr l) 'and)
		#t
		#f)
	#f))
          
;(andByTwo '(a and b and c))
;(andByTwo '((r i) and (not (a i)) and (not (b i)) ))
(define (andByTwo l)
  (if (null? (cdr l))
      (car l)
      (if (not (equal? (cadr l) 'and))
          (error `("il faut un and dans " ,l))
          `(,(car l) and ,(andByTwo (cddr l))))))


;(orByTwo '(a and b and c))
(define (orByTwo L)
  (if (null? (cdr L))
      (car L)
      (if (not (equal? (cadr L) 'or))
          (error "il faut un or")
          `(,(car L) or ,(orByTwo (cddr L))))))


		  
(define (make-bigxor-rec i s bigset psi)
	(if (singleton? s)
		`( ,(remplacer i (car s) psi) and (bigand ,i ,bigset (,i diff ,(car s)) (not ,psi)))
		`(( ,(remplacer i (car s) psi) and (bigand ,i ,bigset (,i diff ,(car s)) (not ,psi))) or ,(make-bigxor-rec i (cdr s) bigset psi))))



;(make-bigxor 'i '(1 2 3) '(p i))
(define (make-bigxor i s psi)
	(if (null? s)
		'bottom
		(if (singleton? s)
			(remplacer i (car s) psi)
			(make-bigxor-rec i s s psi))))


(define (formula-expand-bigand-condition i s condition psi)
	(if (null? s)
         'top
         (if (condition-tester (remplacer i (car s) condition))
             (if (singleton? s)
                 (formula-expand (remplacer i (car s) psi))
                 `(,(formula-expand (remplacer i (car s) psi)) and ,(formula-expand-bigand-condition i (cdr s) condition psi)))
             (formula-expand-bigand-condition i (cdr s)  condition psi)))))


;(formula-expand phi ... à optimiser
;(formula-expand '(bigxor i (1 2 3) (p i)))
;(formula-expand '(p xor q))
(define (formula-expand phi)
  (match (calculer phi)
    (('bigand i s condition psi)
     (if (null? s)
         'top
         (if (condition-tester (remplacer i (car s) condition))
             (if (singleton? s)
                 (formula-expand (remplacer i (car s) psi))
                 `(,(formula-expand (remplacer i (car s) psi)) and ,(formula-expand `(bigand ,i ,(cdr s) ,condition ,psi))))
             (formula-expand `(bigand ,i ,(cdr s)  ,condition ,psi)))))
    (('bigor i s condition psi)
     (if (null? s)
         'bottom
         (if (condition-tester (remplacer i (car s) condition))
            (if (singleton? s)
             (formula-expand (remplacer i (car s) psi))
             `(,(formula-expand (remplacer i (car s) psi)) or ,(formula-expand `(bigor ,i ,(cdr s) ,condition ,psi))))
             (formula-expand `(bigor ,i ,(cdr s)  ,condition ,psi)))))
    (('bigand i s psi)
     (if (null? s)
         'top
         (if (singleton? s)
           (formula-expand (remplacer i (car s) psi))
         `(,(formula-expand (remplacer i (car s) psi)) and ,(formula-expand `(bigand ,i ,(cdr s) ,psi))))))
    (('bigor i s psi)
     (if (null? s)
         'bottom
         (if (singleton? s)
             (formula-expand (remplacer i (car s) psi))
         `(,(formula-expand (remplacer i (car s) psi)) or ,(formula-expand `(bigor ,i ,(cdr s) ,psi))))))
    (('bigxor i s psi)
	  (formula-expand (make-bigxor i s psi)))
    ((phi 'and psi)
     `(,(formula-expand phi) and ,(formula-expand psi)))
    
    ((phi 'or psi)
     `(,(formula-expand phi) or ,(formula-expand psi)))
    
    ((phi 'xor psi)
     (let ((sphi (formula-expand phi))
           (spsi (formula-expand psi)))
       `((,sphi and ,(negationinnnf spsi)) or (,(negationinnnf sphi) and ,spsi))))
    
    ((phi 'imply psi)
      (let ((spsi (formula-expand psi)))
     `(,(negationinnnf (formula-expand phi)) or ,spsi)))
    
    ((phi 'equiv psi)
    (let ((sphi (formula-expand phi))
           (spsi (formula-expand psi)))
     `((,(negationinnnf spsi) or ,sphi) and (,(negationinnnf sphi) or ,spsi)) ))
    
    
    (('not phi)
     (negationinnnf (formula-expand phi)))
  (a 
   (if (formula-and-multi? a)
       (formula-expand (andByTwo a))
       (if (formula-or-multi? a)
           (formula-expand (orByTwo a))
           a)))
  ))
  




(define (remplacer a b L)
  (list-replace L a b))
  
  




;(negationinnnf '(p and q))
(define (negationinnnf phi)
  (match phi
      ((psi 'and chi)
         `(,(negationinnnf psi) or ,(negationinnnf chi)))
      ((psi 'or chi)
         `(,(negationinnnf psi) and ,(negationinnnf chi)))
      (('not a) a)
      (a `(not ,a))
  ))





(define (make-conjunction L)
  (if (null? (cdr L))
      (car L)
      `(,(car L) and ,(make-conjunction (cdr L)))))











(define (diff a b)
  (not (equal? a b)))
