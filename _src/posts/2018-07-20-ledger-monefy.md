    Title: Tracking Expenses with Ledger
    Date: 2018-07-20T13:34:47
    Tags: ledger, finance, racket, scribble

How I track expenses using ledger, even on my phone.

<!-- more -->

<br></br><br></br>

# Ledger

I use [ledger](https://www.ledger-cli.org/) to track my personal finances.
Ledger is a commandline tool for [double-entry accounting](https://en.wikipedia.org/wiki/Double-entry_bookkeeping_system), and it's most salient feature is that all of my financial data is stored in plain text and ledger never automatically modifies it.
This guarantees that my data will always be easily accessible (no software lock-in) and can't be corrupted by a bug, crash, etc.

The ledger website has a pretty thorough guide to using the tool, so I won't explain in any detail here.
The basic idea is to have entries for every financial transaction that look like this:

    date * (Person or company the transaction is with)
        ; (A note on what this transaction is)
        (An account which is credited or debited)  (Amount to credit/debit)
        (An account which is credited or debited)  (Amount to credit/debit)
    
    ; Example:
    
    2018/07/17 * Ben's Noodles
        ; Dinner
        expenses:basics:food  25.0
        liabilities:cards:visa  -25.0

Then, ledger can check my math and produce reports from the commandline, such as how much money I have left in my accounts, or how much I spent on food last month, or all of the transactions I made with Ben's Noodles since September of this year.

<br></br><br></br>

# Tracking expenses when not at the computer

While I greatly appreciate ledger's simplicity and compatibility with unix tools, one of my main quibbles with it early on was keeping track of expenses when I am not at the computer.
Most of my expenses are incurred at times when I can't add them to my ledger file, so I needed a way to temporarily store entries and a mechanism to import them into my ledger file.
The obvious solution was to use an expense-tracking app which supports data export.

I use [Monefy](https://play.google.com/store/apps/details?id%3Dcom.monefy.app.lite&hl%3Den_US), and it suits my needs pretty well.
It has all of the basic components of a ledger entry as described above, so it suffices for the simple transactions that make up the majority.

Monefy provides a facility to export its transactions to csv, so I wrote a few functions to automatically convert the csv export to ledger entries.
The main entry point, `ll/ledger/parse-myexpenses-csv`, prompts for a filepath and then inserts the ledger entries into the `*scratch*` buffer, where I can review them and then copy-pasta them into my ledger file.

    (defun ll/parse-csv (buf &optional sep)
      "ll/parse-csv: buffer [string] -> (listof (listof string))
    
    Parse the contents of BUF as csv into a list of lines, optionally
    providing a seperator SEP."
      (let ((result nil))
        (with-current-buffer buf
          (goto-char (point-min))
          (while (not (eobp))
            (let ((line (buffer-substring-no-properties
                         (line-beginning-position) (line-end-position))))
              (push (split-string line (or sep ",")) result))
            (forward-line 1)))
        (reverse result)))
    
    (defun ll/ledger/insert-as-entry/myexpenses (csv-entry)
      "ll/ledger/insert-as-entry/myexpenses: (listof string) -> void
    
    Insert (into the current buffer) a ledger entry corresponding to
     CSV-ENTRY (an entry as those returned by `ll/parse-csv')."
      (let ((date (second csv-entry))
            (payee (third csv-entry))
            (amount (string-to-number
                     (if (string-equal (fourth csv-entry) "0")
                         (fifth csv-entry)
                       (concat "-" (fourth csv-entry)))))
            (to-account (sixth csv-entry))
            (from-account (ninth csv-entry))
            (comment (eighth csv-entry)))
        (insert date " * " payee "\n"
                "    ; " comment "\n"
                "    " to-account "  " (number-to-string amount) "\n"
                "    " from-account "  " (number-to-string (- amount)) "\n\n\n")))
    
    
    (defun ll/ledger/parse-myexpenses-csv (&optional filepath)
      "Parse the My Expenses csv file at FILEPATH and append its contents to
     the *scratch* buffer as ledger entries."
      (interactive)
      (let* ((filepath (or filepath
                           (helm-read-file-name "My Expenses csv file: ")))
             (buffer (find-file-noselect filepath)))
        (with-current-buffer buffer
          (replace-string "\"" ""))
        (switch-to-buffer "*scratch*")
        (end-of-buffer)
        (mapc (function ll/ledger/insert-as-entry/myexpenses)
              (cdr (ll/parse-csv buffer ";")))
        (kill-buffer buffer)))

<br></br><br></br>

# Recurring ledger entries

The other main hitch that I have encountered with ledger is that it provides no builtin mechanism for repeating transactions.
For example, I need to pay rent for the same amount on the same day every month.
I don't want to manually insert this identical transaction every month, and an automated approach ensures I can't forget to do it.

Fortunately, this is where ledger's data being stored in plaintext becomes a great advantage.
Any number of tools can be employed to augment ledger's features to fix issues like this.
For this particular issue, I use a text preprocessor - specifically, [scribble](https://docs.racket-lang.org/scribble-pp/index.html) - to programmatically generate the recurring ledger entries.
Since I use scribble, I implement the recurring ledger entries as a few simple racket functions that return the text to be inserted.
Then I invoke the functions within my ledger file.
This involves executing my ledger file as a step before running ledger for reports and queries, but it works pretty well (I just have a wrapper script that takes care of this whenever I run ledger).

Using these definitions (I put it in a module called `ledger-repeat.rkt`):

    #lang racket/base
    
    (require racket/date racket/string)
    
    (define (!= a b)
      (not (= a b)))
    
    ;; ldate is just a simpler struct for representing dates than
    ;; racket/date's
    (define-struct ldate (year month day) #:prefab)
    
    (define (ltoday)
      (let ([date-today (seconds->date (current-seconds))])
        (make-ldate (date-year date-today)
                    (date-month date-today)
                    (date-day date-today))))
    
    (define (ldate-< d1 d2)
      (cond [(!= (ldate-year d1) (ldate-year d2))
             (< (ldate-year d1) (ldate-year d2))]
    
            [(!= (ldate-month d1) (ldate-month d2))
             (< (ldate-month d1) (ldate-month d2))]
    
            [else
             (<  (ldate-day d1) (ldate-day d2))]))
    
    (define (next-month a-date)
      (if (= (ldate-month a-date) 12)
          (make-ldate (add1 (ldate-year a-date))
                      1
                      (ldate-day a-date))
          (make-ldate (ldate-year a-date)
                      (add1 (ldate-month a-date))
                      (ldate-day a-date))))
    
    (define (next-year a-date)
      (make-ldate (add1 (ldate-year a-date))
                  (ldate-month a-date)
                  (ldate-day a-date)))
    
    (define (number->datestr n)
      (if (< n 10)
          (string-append "0" (number->string n))
          (number->string n)))
    
    ;; format str contains any of "%y %m %d"
    (define (format-date format-str a-date)
      (string-replace
       (string-replace
        (string-replace format-str
                        "%y"
                        (number->string (ldate-year a-date)))
        "%m"
        (number->datestr (ldate-month a-date)))
       "%d"
       (number->datestr (ldate-day a-date))))
    
    (define (repeat-biweekly format-str-base
                             #:from from
                             #:until [until #f]
                             . other-format-strs)
      (define format-str (apply string-append
                                (cons format-str-base other-format-strs)))
      (repeat-monthly (string-append (string-replace format-str "%d" "01")
                                     (string-replace format-str "%d" "14"))
                      #:from from
                      #:until until))
    
    (define (repeat-yearly format-str-base
                           #:from from
                           #:until [until #f]
                           . other-format-strs)
      (define format-str (apply string-append
                                (cons format-str-base other-format-strs)))
      (let repeat ([output-so-far ""]
                   [from from]
                   [until (or until (ltoday))])
        (if (ldate-< from until)
            (repeat (string-append output-so-far
                                   (format-date format-str from))
                    (next-year from)
                    until)
            output-so-far)))
    
    (define (repeat-monthly format-str-base
                            #:from from
                            #:until [until #f]
                            . other-format-strs)
      (define format-str (apply string-append
                                (cons format-str-base other-format-strs)))
      (let repeat ([output-so-far ""]
                   [from from]
                   [until (or until (ltoday))])
        (if (ldate-< from until)
            (repeat (string-append output-so-far
                                   (format-date format-str from))
                    (next-month from)
                    until)
            output-so-far)))
    
    (provide repeat-monthly repeat-yearly repeat-biweekly ldate)

I can repeat items yearly, monthly, and biweekly in my ledger file like so

    #lang scribble/text
    
    @require{ledger-repeat.rkt}
    ; rent
    @repeat-monthly[#:from (ldate 2016 1 1) #:until (ldate 2018 5 30)]{
    %y/%m/%d * Management
        ; Monthly rent
        expenses:basics:rent  300
        checkings
    @; Ensure newline
    @"\n"
    }

Running

    racket ledger.dat

produces the "plain" ledger data file that can be fed into ledger by piping the output to ledger and passing the `-f -` flag (indicating to read data from stdin).
For example, getting the balance report looks like this:

    racket ledger.dat | /usr/bin/ledger bal -f -
