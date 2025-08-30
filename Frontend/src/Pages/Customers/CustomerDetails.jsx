import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUpload, FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import { HOME_API } from '../../lib/constant';
const XLSX = require('xlsx');

Modal.setAppElement('#root');

const CustomerDetails = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedButton, setSelectedButton] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editedData, setEditedData] = useState({ customer_name: '', template_name: '' });
  const [selectedEmailStatus, setSelectedEmailStatus] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(fetchUsers, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${HOME_API}/user/customerDetails`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSelectAllChange = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      const notSentCustomerEmails = customers.filter(user => user.status !== 'sent').map(user => user.customer_email);
      setSelectedCustomers(notSentCustomerEmails);
    } else {
      setSelectedCustomers([]);
    }
  };

  ////////////////////// export email //////////////////////
  const handleExportEmails = (statusType) => {
    const filteredEmails = customers
      .filter(user => statusType === 'opened' ? user.isEmailOpened : !user.isEmailOpened)
      .map(user => ({ Email: user.customer_email }));

    const worksheet = XLSX.utils.json_to_sheet(filteredEmails);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Emails');
    XLSX.writeFile(workbook, `emails_${statusType}.xlsx`);

    setIsExportModalOpen(false);
  };

  ////////////////////// download demo excel //////////////////////
  const generateSampleExcel = () => {
    const demoData = [
      { customer_name: "John Doe", customer_email: "john@example.com", template_name: "WelcomeTemplate" },
      { customer_name: "Jane Smith", customer_email: "jane@example.com", template_name: "PromoTemplate" }
    ];

    const worksheet = XLSX.utils.json_to_sheet(demoData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "demo_customers.xlsx");
  };

  const handleCustomerCheckboxChange = (event, customerEmail) => {
    if (event.target.checked) {
      setSelectedCustomers(prev => [...prev, customerEmail]);
    } else {
      setSelectedCustomers(prev => prev.filter(email => email !== customerEmail));
      setSelectAll(false);
    }
  };

  const handleSendNow = async () => {
    try {
      for (const customerEmail of selectedCustomers) {
        const customer = customers.find(user => user.customer_email === customerEmail);
        if (customer && customer.status !== 'sent') {
          try {
            const response = await axios.post(`${HOME_API}/mail/send-email`, {
              recipientEmail: customerEmail,
              templateName: customer.template_name,
              id: customer._id
            });

            if (response.status === 200) {
              await axios.put(`${HOME_API}/user/updatecustomerDetails/${customer._id}`, { status: 'sent' });
              toast.success(`Sending mail to ${customerEmail}`);
            } else if (response.status === 400 && response.data.error === 'Recipient email does not exist') {
              await axios.put(`${HOME_API}/user/updatecustomerDetails/${customer._id}`, { status: response.data.error });
              toast.error(response.data.error);
            }
          } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error sending email';
            toast.error(errorMessage);
            await axios.put(`${HOME_API}/user/updatecustomerDetails/${customer._id}`, { status: errorMessage });
          }
        }
      }
      fetchUsers();
      setSelectedCustomers([]);
      setSelectAll(false);
    } catch (error) {
      toast.error('Error sending email');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post(`${HOME_API}/upload`, formData)
      .then((response) => toast.success(response.data.message))
      .catch((error) => toast.error(error.response.data.error));
  };

  const handleButtonClick = (button) => setSelectedButton(button);

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditedData({ customer_name: customer.customer_name, template_name: customer.template_name });
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`${HOME_API}/deleteCustomer/${customerId}`);
        toast.success('Customer deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      await axios.put(`${HOME_API}/editcustomerDetails/${editingCustomer._id}`, editedData);
      toast.success('Customer updated');
      setEditingCustomer(null);
      fetchUsers();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDeleteAllCustomers = async () => {
    if (window.confirm('Are you sure you want to delete ALL customers? This action cannot be undone.')) {
      try {
        await axios.delete(`${HOME_API}/deleteAllCustomers`);
        toast.success('All customers deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete all customers');
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-black bg-cover text-white w-full min-h-screen p-8" style={{ backgroundImage: 'url("../../assets/background.png")' }}>
      <h1 className="text-3xl font-bold mb-2">Connect, Communicate, and Track</h1>
      <p className="text-center mb-6">Customer Engagement Hub - List Upload, Email Campaigns, and Sent Mail Reports</p>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button className={`px-5 py-2 rounded-md text-sm transition-colors ${selectedButton === 'upload' ? 'bg-teal-500' : 'bg-blue-500 hover:bg-blue-600'} text-white`} onClick={() => handleButtonClick('upload')}>Upload</button>
        <button className={`px-5 py-2 rounded-md text-sm transition-colors ${selectedButton === 'send' ? 'bg-teal-500' : 'bg-blue-500 hover:bg-blue-600'} text-white`} onClick={() => handleButtonClick('send')}>Send Mail</button>
      </div>

      <div className="w-full max-w-6xl">
        {selectedButton === 'upload' && (
          <form className="flex flex-col items-center w-full gap-4" onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-2">Upload Excel Sheet</h2>
            <label htmlFor="file-upload" className="w-full max-w-md p-6 text-center border-2 border-dashed border-gray-500 rounded-lg bg-neutral-800 hover:border-blue-400 transition-colors cursor-pointer">
              <FaUpload className="text-2xl mb-2" />
              <span className="block">Choose file</span>
              <input id="file-upload" type="file" onChange={handleFileChange} accept=".xls,.xlsx" className="hidden" />
            </label>

            <div className="flex gap-4">
              <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                EXPORT DATA
              </button>
              <button
                type="button"
                onClick={generateSampleExcel}
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
              >
                Download Demo Excel
              </button>
            </div>
          </form>
        )}

        {selectedButton === 'send' && (
          <>
            <h1 className="text-2xl font-semibold mb-4">Mailing list details</h1>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600" onClick={() => setSelectedEmailStatus('all')}>All</button>
              <button className="px-4 py-2 bg-green-700 rounded hover:bg-green-600" onClick={() => setSelectedEmailStatus('opened')}>Opened</button>
              <button className="px-4 py-2 bg-red-700 rounded hover:bg-red-600" onClick={() => setSelectedEmailStatus('notOpened')}>Not Opened</button>
            </div>

            <button className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4" onClick={() => setIsExportModalOpen(true)}>Export Data</button>

            {isExportModalOpen && (
              <Modal isOpen={true} onRequestClose={() => setIsExportModalOpen(false)} className="modal" overlayClassName="overlay">
                <h2 className="text-xl font-bold mb-4">Select Email Status to Export</h2>
                <div className="flex gap-4 mb-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => handleExportEmails('opened')}>Opened</button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => handleExportEmails('notOpened')}>Not Opened</button>
                </div>
                <button className="px-4 py-2 bg-gray-500 rounded text-white" onClick={() => setIsExportModalOpen(false)}>Cancel</button>
              </Modal>
            )}

            <table className="w-full mt-4 border-collapse bg-white/5 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 border border-gray-600 text-left">Customer Email</th>
                  <th className="px-4 py-3 border border-gray-600 text-left">Template</th>
                  <th className="px-4 py-3 border border-gray-600 text-left">
                    Select All <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
                  </th>
                  <th className="px-4 py-3 border border-gray-600 text-left">Actions</th>
                  <th className="px-4 py-3 border border-gray-600 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers
                  .filter(user => {
                    if (selectedEmailStatus === 'opened') return user.isEmailOpened === true;
                    if (selectedEmailStatus === 'notOpened') return user.isEmailOpened === false;
                    return true;
                  })
                  .map(user => (
                    <tr key={user._id} className="hover:bg-white/10">
                      <td className="px-4 py-3 border border-gray-600">{user.customer_email}</td>
                      <td className="px-4 py-3 border border-gray-600">{user.template_name}</td>
                      <td className="px-4 py-3 border border-gray-600">
                        <input type="checkbox" checked={selectedCustomers.includes(user.customer_email)} onChange={(e) => handleCustomerCheckboxChange(e, user.customer_email)} />
                      </td>
                      <td className="px-4 py-3 border border-gray-600 flex gap-2">
                        <button onClick={() => handleEditClick(user)} className="text-yellow-400"><FaEdit /></button>
                        <button onClick={() => handleDeleteCustomer(user._id)} className="text-red-500"><FaTrash /></button>
                      </td>
                      <td className="px-4 py-3 border border-gray-600">
                        {user.isEmailOpened ? (
                          <span className="text-green-500 font-semibold">Opened</span>
                        ) : (
                          <span className="text-red-500 font-semibold">Not Opened</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {selectedCustomers.length > 0 && (
              <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded-md" onClick={handleSendNow}>Send Now</button>
            )}
            <button className="mt-4 px-5 py-2 bg-red-600 text-white rounded-md" onClick={handleDeleteAllCustomers}>Delete All</button>
          </>
        )}

        {editingCustomer && (
          <Modal isOpen={true} onRequestClose={() => setEditingCustomer(null)} className="modal" overlayClassName="overlay">
            <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
            <label className="block mb-2">Name:
              <input className="w-full p-2 mt-1 border rounded bg-gray-800 text-white" value={editedData.customer_name} onChange={(e) => setEditedData(prev => ({ ...prev, customer_name: e.target.value }))} />
            </label>
            <label className="block mb-4">Template:
              <input className="w-full p-2 mt-1 border rounded bg-gray-800 text-white" value={editedData.template_name} onChange={(e) => setEditedData(prev => ({ ...prev, template_name: e.target.value }))} />
            </label>
            <button className="px-4 py-2 bg-green-600 text-white rounded mr-2" onClick={handleUpdateCustomer}>Update</button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={() => setEditingCustomer(null)}>Cancel</button>
          </Modal>
        )}

        <ToastContainer position="bottom-right" autoClose={1000} theme="dark" />
      </div>
    </div>
  );
};

export default CustomerDetails;
