import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onReject: () => void;
}

export function TermsModal({ open, onOpenChange, onAccept, onReject }: TermsModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleAccept = () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      return;
    }
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
          <DialogDescription>
            Please read and accept our terms before proceeding
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted">
          <div className="space-y-6 pr-4">
            {/* Terms of Service */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Terms of Service</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {`1. AGREEMENT TO TERMS
We offer these terms as they are. By using our service, you agree to comply with these Terms of Service and all applicable laws and regulations.

2. USE LICENSE
Permission is granted to temporarily download one copy of materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copying the materials
- Using the materials for any commercial purpose or for any public display
- Attempting to decompile or reverse engineer any software contained on the site
- Removing any copyright or other proprietary notations
- Transferring the materials to another person or "mirroring" the materials on any other server

3. DISCLAIMER
The materials on the site are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. LIMITATIONS
In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our site.

5. ACCURACY OF MATERIALS
The materials appearing on our site could include technical, typographical, or photographic errors. We do not warrant that any of the materials on the site are accurate, complete, or current.

6. MODIFICATIONS
We may revise these terms of service for the site at any time without notice. By using this site, you are agreeing to be bound by the then current version of these terms of service.`}
              </p>
            </div>

            {/* Privacy Policy */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {`PRIVACY POLICY

1. INFORMATION WE COLLECT
We collect information you provide directly, such as when you create an account, make a purchase, or contact us. This includes:
- Name, email address, and password
- Delivery address and phone number
- Payment information (processed securely)
- Order history and preferences

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Process your orders and deliver products
- Send you order and account-related emails
- Improve our website and services
- Respond to your inquiries
- Prevent fraudulent transactions
- Comply with legal obligations

3. INFORMATION SHARING
We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.

4. COOKIES
We use cookies to enhance your experience on our site. Cookies allow us to remember your preferences and understand how you use our site.

5. DATA SECURITY
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

6. YOUR RIGHTS
You have the right to access, correct, or delete your personal information. Contact us at support@aceflowershop.com to exercise these rights.

7. CHANGES TO THIS POLICY
We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our site.

8. CONTACT US
If you have questions about this privacy policy, please contact us at support@aceflowershop.com`}
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 mt-6">
          {/* Checkboxes */}
          <div className="space-y-3 border-l-4 border-primary pl-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="font-medium cursor-pointer">
                I agree to the Terms of Service
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
              />
              <Label htmlFor="privacy" className="font-medium cursor-pointer">
                I agree to the Privacy Policy
              </Label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onReject}>
              Reject & Exit
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!agreedToTerms || !agreedToPrivacy}
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
