#lang racket/base

(require (rename-in scribble/base
                    [section scribble:section]
                    [subsection scribble:subsection]
                    [subsubsection scribble:subsubsection])
         scribble/core
         scribble/html-properties)

(provide section
         subsection
         subsubsection
         external-img)

(define (section . els)
  (apply scribble:section #:style 'unnumbered els))
(define (subsection . els)
  (apply scribble:subsection #:style 'unnumbered els))
(define (subsubsection . els)
  (apply scribble:subsubsection #:style 'unnumbered els))

;; source: "Implementing Styles" section
(define (external-img url #:alt alt #:style html-style-str)
  (elem
   #:style
   (style #f
          (list (alt-tag "img")
                (attributes
                 `((src . ,url)
                   (alt . ,alt)
                   (style . ,html-style-str)))))))
