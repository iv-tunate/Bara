"use client";
import Image from "next/image";
import { useState, FormEvent } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";

// Define the props interface for the AddCardModal component
// This modal allows users to add a new payment card for funding their wallet
interface AddCardModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  onCardAdded: (cardData: {
    // Callback function when card is successfully added
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => void;
}

// --- AddCardModal Component ---
// Modal component for adding a new payment card
// Handles card details collection and validation
function AddCardModal({ isOpen, onClose, onCardAdded }: AddCardModalProps) {
  // State management for card input fields
  const [cardNumber, setCardNumber] = useState(""); // Stores the 16-digit card number
  const [expiry, setExpiry] = useState(""); // Stores expiry date in MM/YY format
  const [cvv, setCvv] = useState(""); // Stores 3-digit CVV code

  // Early return if modal is not open - prevents unnecessary rendering
  if (!isOpen) return null;

  // Form validation logic - ensures all required fields meet minimum length requirements
  const isFormValid =
    cardNumber.trim().length >= 16 && // Card number must be at least 16 digits
    expiry.trim().length >= 4 && // Expiry must be at least 4 characters (MM/YY)
    cvv.trim().length >= 3; // CVV must be at least 3 digits

  // Handle form submission when user clicks "Add card"
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!isFormValid) return; // Exit if form is invalid
    onCardAdded({ cardNumber, expiry, cvv }); // Pass card data to parent component
    onClose(); // Close modal after successful submission
  };

  // Render the modal overlay and form
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 z-50">
      <DashboardNavbar />

      {/* Back Button */}
      <button
        onClick={onClose}
        className="absolute cursor-pointer mt-10 ml-6 md:ml-24 mb-4"
      >
        <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
      </button>

      <div className="flex flex-col justify-center items-center">
        {/* Modal container with white background */}

        <div className="bg-white my-8 p-8 max-w-2xl w-full mt-15">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Modal header */}
            <h2 className="text-2xl font-semibold mb-4">Add a new card</h2>
            {/* Card number input field */}
            <div>
              <label className="block text-sm text-gray-800 mb-1">
                Card number
              </label>
              <input
                type="number"
                placeholder="1234 5678 9012 3456"
                className="w-full border border-[#ABADB2] rounded-sm px-3 py-2 focus:outline-none"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>
            {/* Expiry date and CVV inputs in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Expiry date input */}
              <div>
                <label className="block text-sm text-gray-800 mb-1">
                  Expiry date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full border border-[#ABADB2] rounded-sm px-3 py-2 focus:outline-none"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>
              {/* CVV input */}
              <div>
                <label className="block text-sm text-gray-800 mb-1">CVV</label>
                <input
                  type="number"
                  placeholder="123"
                  className="w-full border border-[#ABADB2] rounded-sm px-3 py-2 focus:outline-none"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Checkbox for saving card for future use */}
            {/* Action buttons */}
            <div className="flex flex-col gap-4 mt-4">
              {/* Submit button - enabled only when form is valid */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full px-4 py-2 rounded-sm transition ${
                  isFormValid
                    ? "bg-[#810306] text-white cursor-pointer hover:bg-[#810306]/70"
                    : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                }`}
              >
                Add card
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- FundProducer Component ---
// Main component for funding a producer's wallet
// Provides interface to select/add payment card and enter funding amount
interface FundProducerProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
}

export default function FundProducer({ isOpen, onClose }: FundProducerProps) {
  // State management for the funding form
  const [amount, setAmount] = useState(""); // Stores the funding amount
  const [selectedCard, setSelectedCard] = useState<any>(null); // Stores the selected payment card data
  const [isAddCardModalOpen, setAddCardModalOpen] = useState(false); // Controls add card modal visibility

  // Early return if modal is not open - prevents unnecessary rendering
  if (!isOpen) return null;

  // Handler for when a new card is added via the AddCardModal
  const handleCardAdded = (cardData: any) => {

    setSelectedCard(cardData);
  };

  // Form validation - ensures both amount and card are selected before submission
  const isPaymentFormValid = amount.trim() !== "" && selectedCard !== null;

  // Handle the main payment form submission
  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!isPaymentFormValid) return; // Exit if form is invalid
    
  
    console.log("Submitting payment with:", { amount, selectedCard });
    onClose(); // Close the main modal after successful submission
  };

  // Render the main funding modal
  return (
    <div>
      {/* Full-screen white overlay with navigation */}
      <div className="fixed inset-0 bg-white z-40 overflow-auto">
        {/* Navigation bar with back button */}
        <DashboardNavbar />
        {/* Back button to close the modal */}
        <button
          onClick={onClose}
          className="cursor-pointer mt-6 ml-6 md:ml-24 mb-4"
        >
          <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
        </button>

        {/* Main content container */}
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-4 flex flex-col gap-10">
          {/* Page header */}
          <div>
            <h2 className="text-2xl font-semibold">Fund your Account</h2>
            <p className="text-gray-700 mt-1">
              Select or add a card to fund your wallet
            </p>
          </div>

          {/* Payment form */}
          <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
            {/* Card selection section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCard ? (
                // Display selected card with masked number
                <div className="border border-green-500 rounded-md p-4 bg-green-50 flex flex-col justify-center">
                  <p className="font-semibold text-green-800">Card Selected:</p>
                  <p>**** **** **** {selectedCard.cardNumber.slice(-4)}</p>
                </div>
              ) : null}

              {/* Add new card button - opens AddCardModal when clicked */}
              <div
                onClick={() => setAddCardModalOpen(true)}
                className={`border border-gray-300 rounded-md p-10 cursor-pointer bg-gray-50 transition flex flex-col items-center justify-center gap-3 ${
                  !selectedCard ? "md:col-span-2" : ""
                }`}
              >
                <p className="text-gray-600 font-medium">
                  {selectedCard ? "Add card" : "Add new card"}
                </p>
                <Image src="/Add.png" alt="Add" width={24} height={24} />
              </div>
            </div>

            {/* Amount input section */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm text-gray-800 mb-1"
              >
                Enter amount
              </label>
              {/* Currency selector and amount input in one container */}
              <div className="flex items-center border border-[#ABADB2] rounded-sm px-3 py-2 gap-3">
                {/* Currency selector dropdown (currently only NGN) */}
                <div className="flex items-center gap-2 border border-[#ABADB2] rounded-sm px-2 py-1">
                  <Image
                    src="/naijaFlag.svg"
                    alt="NGN"
                    width={20}
                    height={20}
                  />
                  <p className="text-sm">NGN</p>
                  <Image
                    src="/dropdown.svg"
                    alt="Dropdown"
                    width={10}
                    height={10}
                  />
                </div>
                {/* Amount input field */}
                <input
                  type="number"
                  id="amount"
                  placeholder="400,000"
                  className="w-full border-none focus:outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit button - enabled only when form is valid */}
            <button
              type="submit"
              disabled={!isPaymentFormValid}
              className={`w-full px-4 py-2 rounded-sm transition ${
                isPaymentFormValid
                  ? "bg-[#810306] text-white cursor-pointer hover:bg-[#810306]/70"
                  : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
              }`}
            >
              Continue to payment
            </button>
          </form>
        </div>
      </div>

      {/* Render the AddCardModal as an overlay */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setAddCardModalOpen(false)}
        onCardAdded={handleCardAdded}
      />
    </div>
  );
}
