'use client'

export async function handleNewsLetterSubscriptionRequest(
    e: React.FormEvent<HTMLFormElement>,
    requestFunc: (formData: FormData) => Promise<string>
  ): Promise<boolean> {
    // Prevent default form submission refresh
    e.preventDefault();
  
    const formData = new FormData(e.currentTarget);
    const res: string = await requestFunc(formData);
    
    // Check if response contains an error message
    if (res.startsWith('Error')) {
        console.error('Newsletter subscription failed:', res);
        return false;
    }
    
    return true;
  }