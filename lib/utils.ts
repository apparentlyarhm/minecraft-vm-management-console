import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useToast } from "@/components/context/ToastContext";

// const { success, error, info } = useToast(); 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const handleIpAdd = async (address: string) => {
//   info({
//     heading: "Request sent",
//     message: "IP will be added",
//     duration: 2000,
//   });

//   setTimeout(() => {
//     const isSuccess = Math.random() > 0.5; // 50% chance of success or failure

//     if (isSuccess) {
//       success({
//         heading: "Success",
//         message: "IP added successfully!",
//         duration: 3000,
//       });
//     } else {
//       error({
//         heading: "Failed",
//         message: "Failed to add IP. Please try again.",
//         duration: 3000,
//       });
//     }
//   }, 2500);
// };