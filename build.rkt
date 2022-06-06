#lang at-exp rscript

(require file/glob)

(define-runtime-paths
  [home "home.html"]
  [index "index.html"]
  [here "."])

(define build-location here)

(define prepare-steps
  (list))

(define (rename-index->blog path)
  (regexp-replace #rx"/index(.*)\\.html$" (~a path) "/blog\\1.html"))

(define postprocess-steps
  (list (thunk (replace-in-file! home #rx"/home/" "/img/"))
        (thunk (parameterize ([current-directory (simple-form-path here)])
                 (for ([index (in-glob "index*.html")])
                   (copy-file index
                              (rename-index->blog index)
                              #t))))
        (thunk (copy-file home index #t))))

(main
 #:arguments {[flags positional-args]}
 #:check [(path-to-existant-file? home)
          @~a{Unable to find Home page at @home}]

 (parameterize ([current-directory build-location])
   (displayln "Performing prepare steps...")
   (for ([step (in-list prepare-steps)])
     (step))
   (displayln "Done.")

   (displayln "Building...")
   (system "raco frog -b")
   (displayln "Done.")

   (displayln "Performing post-processing steps...")
   (for ([step (in-list postprocess-steps)])
     (step))
   (displayln "Done.")))
