import toast from "react-hot-toast";

export default function ToastError(message: string | null | undefined) {
  if(!message){
    toast.error("An unexpected error occurred. Please try again or contact support");
  }
    toast.error(message as string, {
      style: {
        borderRadius: "8px",
        background: "#fff",
        color: "#800000",
        border: "1px solid #ffd5d5",
      },
      duration: 4000,
    });
}
