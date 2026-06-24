export type LoanStatus = "ACTIVE" | "RETURNED";

export type LoanUser = { id: number; name: string; email: string };
export type LoanBook = { id: number; title: string; available: boolean };

export type Loan = {
  id: number;
  userId: number;
  bookId: number;
  loanDate: string;
  returnDate: string | null;
  status: LoanStatus;
  user: LoanUser;
  book: LoanBook;
};
