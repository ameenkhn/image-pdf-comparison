import React, { useState } from 'react';

const FormComparisonTable = () => {
  const [data, setData] = useState([
    {
      field: 'Discretionary Discount',
      oreoBookingForm: '0',
      orderForm: '0',
      comparisonSummary: 'true'
    },
    {
      field: 'Operation Type',
      oreoBookingForm: 'New',
      orderForm: 'New', 
      comparisonSummary: 'true'
    },
    {
      field: 'Quantity',
      oreoBookingForm: '30',
      orderForm: '30',
      comparisonSummary: 'true'
    },
    {
      field: 'Product',
      oreoBookingForm: 'Agentspace Enterprise Plus: Subscription one month term, Agentspace Enterprise Plus: Subscription-one month term',
      orderForm: 'Agentspace Enterprise Plus: Subscription - one month term, Agentspace Enterprise Plus: Subscription - one month term (per user per month) 92FE-E37F-D407',
      comparisonSummary: 'true'
    },
    {
      field: 'Renewal Type',
      oreoBookingForm: 'Renewable',
      orderForm: '',
      comparisonSummary: 'Value Missing in Order Form'
    },
    {
      field: 'Provisioning Date',
      oreoBookingForm: 'Jul 25, 2025',
      orderForm: '',
      comparisonSummary: 'false'
    },
    {
      field: 'Service Start Date',
      oreoBookingForm: 'Jul 25, 2025',
      orderForm: 'Upon Provisioning',
      comparisonSummary: 'false'
    },
    {
      field: 'Partner Margin Discount',
      oreoBookingForm: '0',
      orderForm: '0',
      comparisonSummary: 'true'
    },
    {
      field: 'Net Amount',
      oreoBookingForm: '1350',
      orderForm: '1350.00',
      comparisonSummary: 'true'
    },
    {
      field: 'Billing Cycle',
      oreoBookingForm: 'Monthly',
      orderForm: 'Monthly',
      comparisonSummary: 'true'
    },
    {
      field: 'Channel Type',
      oreoBookingForm: 'Direct',
      orderForm: 'Direct',
      comparisonSummary: 'true'
    },
    {
      field: 'SKU',
      oreoBookingForm: '92FE-E37F-D407',
      orderForm: '92FE-E37F-D407',
      comparisonSummary: 'true'
    },
    {
      field: 'Contract Sign Date',
      oreoBookingForm: 'Jul 24, 2025',
      orderForm: '2025.07.23',
      comparisonSummary: 'false'
    },
    {
      field: 'Subscription Fee per Month',
      oreoBookingForm: '1350',
      orderForm: '1350.00',
      comparisonSummary: 'true'
    },
    {
      field: 'Service End Date',
      oreoBookingForm: 'Aug 24, 2025',
      orderForm: '',
      comparisonSummary: 'Value Missing in Order Form'
    },
    {
      field: 'Billing Account',
      oreoBookingForm: '01F417-26DA80-3EEA6E',
      orderForm: '',
      comparisonSummary: 'Value Missing in Order Form'
    }
  ]);

  const addRow = () => {
    setData([...data, {
      field: '',
      oreoBookingForm: '',
      orderForm: '',
      comparisonSummary: ''
    }]);
  };

  const updateRow = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    
    // Auto-calculate comparison summary
    if (field === 'oreoBookingForm' || field === 'orderForm') {
      const oreoValue = newData[index].oreoBookingForm.trim();
      const orderValue = newData[index].orderForm.trim();
      
      if (oreoValue === '' && orderValue === '') {
        newData[index].comparisonSummary = 'true';
      } else if (oreoValue === '' || orderValue === '') {
        newData[index].comparisonSummary = oreoValue === '' ? 'Value Missing in Oreo Booking Form' : 'Value Missing in Order Form';
      } else if (oreoValue === orderValue) {
        newData[index].comparisonSummary = 'true';
      } else {
        newData[index].comparisonSummary = 'false';
      }
    }
    
    setData(newData);
  };

  const removeRow = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Form Comparison Tool</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-48">Field</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-64">Oreo Booking Form</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-64">Order Form</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-48">Comparison Summary</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={row.field}
                        onChange={(e) => updateRow(index, 'field', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter field name"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <textarea
                        value={row.oreoBookingForm}
                        onChange={(e) => updateRow(index, 'oreoBookingForm', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="2"
                        placeholder="Oreo Booking Form value"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <textarea
                        value={row.orderForm}
                        onChange={(e) => updateRow(index, 'orderForm', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="2"
                        placeholder="Order Form value"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        row.comparisonSummary === 'true' 
                          ? 'bg-green-100 text-green-800' 
                          : row.comparisonSummary === 'false'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.comparisonSummary}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <button
                        onClick={() => removeRow(index)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-300">
            <button
              onClick={addRow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add New Row
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors">
            Proceed to next Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormComparisonTable;