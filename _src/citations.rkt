#lang at-exp racket

(require (only-in scribble/base
                  hyperlink
                  para
                  bold
                  linebreak
                  emph)
         scriblib/autobib
         scribtex
         (file "~/ghs/grad/reading/refs.rkt")
         "structure.rkt")

(provide render-citation
         bib->tex
         render-talk)

(provide (all-from-out (file "~/ghs/grad/reading/refs.rkt")))


(define people-websites
  (hash
   ;; (author "Lukas" "Lazarek") "https://llazarek.com/About.html"

   (author "Alexis" "King") "https://lexi-lambda.github.io/"
   ;; (author "Samanvitha" "Sundar") ""
   (author "Robert Bruce" "Findler") "https://users.cs.northwestern.edu/~robby/"
   (author "Christos" "Dimoulas") "http://users.eecs.northwestern.edu/~chrdimo/"

   (author "Chu-Pan" "Wong") "http://www.cs.cmu.edu/~chupanw/"
   (author "Jens" "Meinicke") "http://wwwiti.cs.uni-magdeburg.de/~meinicke/"
   (author "Christian" "Kästner") "https://www.cs.cmu.edu/~ckaestne/index.html"
   ))

(define location-shorthands
  (hash POPL "POPL"
        OOPSLA "OOPSLA"))

(define me (author "Lukas" "Lazarek"))
(define author->str
  (match-lambda [(author f l) @~a{@f @l}]))
(define render-author
  (match-lambda
    [(== me)
     (author->str me)]
    [a
     (define name-str (author->str a))
     (match (hash-ref people-websites a #f)
       [#f name-str]
       [url (hyperlink url name-str)])]))

(define (render-x-refs x-refs)
  (add-between (for/list ([(name ref) (in-hash x-refs)])
                 (hyperlink ref @~a{[@name]}))
               " "))

(define (render-citation gb
                         [bib-location #f])
  (match-define (struct* generic-bib
                         ([title title]
                          [authors authors]
                          [details details]
                          [date date]
                          [summary summary]
                          [x-refs x-refs]))
    gb)
  (define location-str
    (match details
      [(or (struct* proceedings ([name name]))
           (struct* journal ([name name])))
       (hash-ref location-shorthands name name)]
      [(? techrpt?) "tech. report"]
      [(? dissertation?) "dissertation"]
      [(? book?) "book"]
      [else "shorthand-missing"]))
  (define author-elements
    (add-between (map render-author authors)
                 ", "))
  (define x-refs+bibtex
    (if bib-location
        (hash-set x-refs "bibtex" bib-location)
        x-refs))
  (define x-refs-elements (render-x-refs x-refs+bibtex))
  @list{
        @bold{@title (@location-str @~a[date])}
        @(linebreak)
        @author-elements
        @(linebreak)
        @x-refs-elements
        @(linebreak)
        @emph[(or summary "")]
        })

(define (render-talk title
                     location-str
                     date
                     more-speakers
                     x-refs
                     description)

  (define x-refs-elements (render-x-refs x-refs))
  @list{
        @bold{@title (@location-str @date)}
        @(linebreak)
        @(if more-speakers
             (list more-speakers (linebreak))
             "")
        @x-refs-elements
        @(linebreak)
        @emph[description]
        })