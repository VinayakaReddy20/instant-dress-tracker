import { AlertCircle, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionConfirmModalProps {
  userEmail: string;
  userType: 'shop_owner' | 'customer';
  onConfirm: () => void;
  onDeny: () => void;
}

const SessionConfirmModal = ({
  userEmail,
  userType,
  onConfirm,
  onDeny,
}: SessionConfirmModalProps) => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <DialogTitle>Session Detected</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {userType === 'shop_owner' 
              ? "A shop owner session was found"
              : "A customer session was found"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Account:</p>
            <p className="text-sm text-gray-700 break-all">{userEmail}</p>
            <p className="text-xs text-gray-600 mt-2">
              Type: <span className="font-medium">
                {userType === 'shop_owner' ? 'Shop Owner' : 'Customer'}
              </span>
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Would you like to continue with this account or log out and start fresh?
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onDeny}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionConfirmModal;
