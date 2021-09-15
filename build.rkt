#lang at-exp rscript

(define-runtime-paths
  [about "about.html"])

(define build-location "/home/lukas/github_sync/projects/website/")

(define prepare-steps
  (list))

(define postprocess-steps
  (list (thunk (replace-in-file! about #rx"/about/" "/img/"))))

(main
 #:arguments {[flags positional-args]}
 #:check [(path-to-existant-file? about)
          @~a{Unable to find About page at @about}]

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
