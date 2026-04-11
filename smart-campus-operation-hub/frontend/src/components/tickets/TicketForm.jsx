import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadAttachment } from '../../api/ticketApi';
import { getResources } from '../../api/resourceApi'; // provided mock setup

/**
 * MEMBER 3: TicketForm component
 */
export default function TicketForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        resourceId: '',
        categoryId: '',
        priority: 'MEDIUM',
        description: '',
        contactNumber: ''
    });
    
    // Member 3 states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resources, setResources] = useState([]);

    useEffect(() => {
        // Fetch resources for dropdown list
        // Note: For now using a mocked fetch if real is not available
        getResources()
            .then(res => setResources(res.data || []))
            .catch(err => {
                console.error("Failed to load resources:", err);
                // Setup some dummy resources for UI validation if endpoint fails
                setResources([
                    { id: 1, name: 'Projector', location: 'Room 401' },
                    { id: 2, name: 'AC Unit', location: 'Hall A' },
                    { id: 3, name: 'Whiteboard', location: 'Room 205' }
                ]);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Member 3 logic: Convert string IDs to numbers as required by DTO
            const payload = {
                ...formData,
                resourceId: formData.resourceId ? parseInt(formData.resourceId) : null,
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : 1 // Default category 1 if empty
            };

            const response = await createTicket(payload);
            const ticketId = response.data.id;
            
            // On success, redirect to ticket detail page
            navigate(`/tickets/${ticketId}`);
        } catch (err) {
            console.error("Failed to submit ticket:", err);
            setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ticket-form p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Ticket</h2>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource / Equipment</label>
                    <select
                        name="resourceId"
                        value={formData.resourceId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a resource</option>
                        {resources.map(res => (
                            <option key={res.id} value={res.id}>{res.name} ({res.location})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        <option value="1">Hardware Issue</option>
                        <option value="2">Software Issue</option>
                        <option value="3">Network/Connectivity</option>
                        <option value="4">General Maintenance</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Provide details about the issue..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>

            <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number (Optional)</label>
                <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="e.g. 0771234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                    type="button" 
                    onClick={() => navigate('/tickets')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Submit Ticket'}
                </button>
            </div>
        </form>
    );
}
