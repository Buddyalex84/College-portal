import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FAKE DEMO FEES DATA
    const demoFees = [
      {
        id: 1,
        semester: 4,
        due_date: "2026-05-10",
        total_amount: 50000,
        paid_amount: 30000,
        payment_status: "partial"
      },
      {
        id: 2,
        semester: 3,
        due_date: "2025-12-10",
        total_amount: 50000,
        paid_amount: 50000,
        payment_status: "paid"
      },
      {
        id: 3,
        semester: 5,
        due_date: "2026-08-15",
        total_amount: 55000,
        paid_amount: 0,
        payment_status: "pending"
      }
    ];

    setFees(demoFees);
    setLoading(false);
  }, []);

  const statusColors = {
    paid: 'bg-emerald-50 text-emerald-700',
    partial: 'bg-yellow-50 text-yellow-600',
    pending: 'bg-red-50 text-red-600',
  };

  return (
    <Layout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Fee Details
          </h1>
          <p className="text-zinc-500 text-sm">
            View your payment information
          </p>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-4">

            {fees.map((fee) => (
              <div
                key={fee.id}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-all"
              >

                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Semester {fee.semester} Fees
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Due Date: {new Date(fee.due_date).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs ${statusColors[fee.payment_status]}`}>
                    {fee.payment_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">

                  <div>
                    <p className="text-xs text-zinc-500">Total Amount</p>
                    <p className="text-xl font-bold">₹{fee.total_amount}</p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Paid Amount</p>
                    <p className="text-xl font-bold text-emerald-700">
                      ₹{fee.paid_amount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Balance</p>
                    <p className="text-xl font-bold text-red-600">
                      ₹{fee.total_amount - fee.paid_amount}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Fees;