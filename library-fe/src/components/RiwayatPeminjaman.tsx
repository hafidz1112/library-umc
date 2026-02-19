import { Calendar } from "lucide-react";

interface Loan {
  id: string;
  bookTitle: string;
  loanDate: string;
  returnDate: string;
  status: string;
}

const RiwayatPeminjaman = ({ loans }: { loans: Loan[] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-red-800 text-white uppercase text-xs font-bold tracking-wider">
            <th className="px-6 py-4 text-left border-r border-red-700/30">Buku</th>
            <th className="px-6 py-4 text-left border-r border-red-700/30">Tanggal Pinjam</th>
            <th className="px-6 py-4 text-left border-r border-red-700/30">Tanggal Kembali</th>
            <th className="px-6 py-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
          {loans.map((loan) => (
            <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold mr-3">
                    {loan.bookTitle.charAt(0)}
                  </div>
                  <span>{loan.bookTitle}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {loan.loanDate}
                </div>
              </td>
              <td className="px-6 py-5 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {loan.returnDate}
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase ${
                  loan.status === "Tepat Waktu" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-yellow-100 text-yellow-600"
                }`}>
                  {loan.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiwayatPeminjaman;