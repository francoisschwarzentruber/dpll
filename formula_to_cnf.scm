;renvoie un couple "(proposition pphi qui représente phi, grande cnf qui équisatisfiable à "pphi <-> phi")"
;(cnfsub 'p)
;(cnfsub '(p and q))
  (define (cnfsub phi)
    (match phi
      ((psi1 'and psi2)
       (let* ((r1 (cnfsub psi1))
             (r2 (cnfsub psi2))
             (pphi (newtempprop))
             (ppsi1 (car r1))
             (ppsi2 (car r2)))
         `(,pphi  ,(append `( ((not ,pphi) ,ppsi1)
                              ((not ,pphi) ,ppsi2)
                              ((not ,ppsi1) (not ,ppsi2) ,pphi) )
                            (append (cadr r1) (cadr r2)      )) )))
      ((psi1 'or psi2)
       (let* ((r1 (cnfsub psi1))
             (r2 (cnfsub psi2))
             (pphi (newtempprop))
             (ppsi1 (car r1))
             (ppsi2 (car r2)))
         `(,pphi  ,(append `( ((not ,ppsi1) ,pphi)
                              ((not ,ppsi2) ,pphi)
                              ((not ,pphi) ,ppsi1 ,ppsi2) )
                           (append (cadr r1) (cadr r2) )     )) ))
      
      (('not psi1)
       (let* ((r1 (cnfsub psi1))
             (pphi (newtempprop))
             (ppsi1 (car r1)))
         `(,pphi  ,(append `( (,ppsi1 ,pphi)
                              ( (not ,pphi) (not ,ppsi1)) )
                               (cadr r1)     )) ))

      (p   `(,p ()))))
  
  
  ;(formulaclause? '(a or b))
  ;(formulaclause? '(a or (not b)))
  (define (formulaclause? phi)
    (match phi
      ((psi1 'and psi2) #f)
      ((psi1 'or psi2) (and (formulaclause? psi1) (formulaclause? psi2)))
      (('not psi)
       (match psi
         ((psi1 'and psi2) #f)
         ((psi1 'or psi2) #f)
         (('not a) #f)
         (a #t)))
      (a #t)))
                        
  
  ;(formulatoclause '(a or (not b)))
  (define (formulatoclause phi)
    (match phi
      ((psi1 'or psi2) (append (formulatoclause psi1) (formulatoclause psi2)))
      (('not p) `(,phi))
      (p `(,phi))))
  
  ;(formulatocnf 'p)
  ;(formulatocnf '(p and q))
  ;(formulatocnf '(p and (not p)))
  (define (formulatocnf phi)
    (match phi
       ((psi1 'and psi2) (append (formulatocnf psi1) (formulatocnf psi2)))
      (phi
       (if (formulaclause? phi)
           `( ,(formulatoclause phi) )
           (let* ((r (cnfsub phi))
                  (prop (car r))
                  (cnfrule (cadr r)))
             (cons `(,prop) cnfrule))))))
