import React from 'react';
import TicketForm from '../../components/tickets/TicketForm';

/**
 * MEMBER 3: Ticket Create Page
 * Provides the wrapper page context for the Ticket form.
 */
export default function TicketCreatePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Report an Issue
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Please provide details about the campus issue so our operations team can resolve it quickly.
                    </p>
                </div>
                
                <TicketForm />
            </div>
        </div>
    );
}
