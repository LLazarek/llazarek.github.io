#lang frog/config

;; Called early when Frog launches. Use this to set parameters defined
;; in frog/params.
(define/contract (init)
  (-> any)
  (current-decorate-feed-uris? #f)
  (current-scheme/host "https://llazarek.github.io")
  (current-title "llazarek")
  (current-author "Lukas Lazarek"))

;; Called once per post and non-post page, on the contents.
(define/contract (enhance-body xs)
  (-> (listof xexpr/c) (listof xexpr/c))
  ;; Here we pass the xexprs through a series of functions.
  (~> xs
      (syntax-highlight #:python-executable "python"
                        #:line-numbers? #t
                        #:css-class "source")
      ;; (auto-embed-tweets #:parents? #t)
      (add-racket-doc-links #:code? #t #:prose? #f)))

;; Called from `raco frog --clean`.
(define/contract (clean)
  (-> any)
  (void))
