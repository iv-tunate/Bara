"use client";
import Image from "next/image";
import { useState, FormEvent } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import FundingSuccessModal from "@/components/FundingSuccessModal";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: (cardData: {
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => void;
}

// --- AddCardModal Component ---
function AddCardModal({ isOpen, onClose, onCardAdded }: AddCardModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const isFormValid =
    cardNumber.trim().length >= 16 &&
    expiry.trim().length >= 4 &&
    cvv.trim().length >= 3;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onCardAdded({ cardNumber, expiry, cvv });
    onClose();
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
interface FundProducerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundProducer({ isOpen, onClose }: FundProducerProps) {
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isAddCardModalOpen, setAddCardModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleCardAdded = (cardData: any) => {
    setSelectedCard(cardData);
  };

  // Handler for closing the success modal and resetting the form state
  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    setAmount("");
    onClose();
  };

  // ensures both amount and card are selected before submission
  const isPaymentFormValid = amount.trim() !== "" && selectedCard !== null;

  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isPaymentFormValid) return;
    console.log("Submitting payment with:", { amount, selectedCard });
    setSuccessModalOpen(true);
  };

  return (
    <div>
      <div className="fixed inset-0 bg-white z-40 overflow-auto">
        <DashboardNavbar />
        <button
          onClick={onClose}
          className="cursor-pointer mt-6 ml-6 md:ml-24 mb-4"
        >
          <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
        </button>

        {/* Main content container */}
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-4 flex flex-col gap-10">
          <div>
            <h2 className="text-2xl font-semibold">Fund your account</h2>
            <p className="text-gray-700 mt-1">
              Select the card you want to fund your wallet from
            </p>
          </div>

          {/* Payment form */}
          <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
            {/* Card selection section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCard ? (
                // Display selected card with masked number
                <div className="text-sm border border-gray-300 rounded-md p-2 bg-[url(/card-bg.png)] bg-cover flex flex-col gap-20">
                  <p className="text-md font-semibold">GTBank</p>
                  <div className="flex flex-row gap-2">
                    <Image
                      src="/mastercard-logo.svg"
                      alt="mastercard logo"
                      width={40}
                      height={30}
                    />
                    <p>****{selectedCard.cardNumber.slice(-4)}</p>
                  </div>
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
                  {selectedCard ? "Add new card" : "Add new card"}
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
                Add amount
              </label>
              <div className="flex items-center border border-[#ABADB2] rounded-sm px-3 py-2 gap-3">
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

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setAddCardModalOpen(false)}
        onCardAdded={handleCardAdded}
      />

      <FundingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
}
