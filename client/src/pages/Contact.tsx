import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Navigation, MessageCircle } from "lucide-react";
import { useEffect } from "react";

const googleMapsUrl = "https://www.google.com/maps/place/Krishna+Electronics/@30.7318009,76.5426843,12z/data=!4m10!1m2!2m1!1skrishna+electronics!3m6!1s0x390feda6178c691f:0x76bd35df6cb7a6a5!8m2!3d30.7318009!4d76.6951196!15sChNrcmlzaG5hIGVsZWN0cm9uaWNzWhUiE2tyaXNobmEgZWxlY3Ryb25pY3OSARNlbGVjdHJvbmljc19jb21wYW55mgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDJ0R00yRkdhelJqV0VJMFpVWlNjbEl3TVRSTVZFcE5UVVpLWm1Rd1JSQULgAQD6AQQIABAy!16s%2Fg%2F1tdxj7ly?entry=ttu";
const mapEmbedUrl = "https://www.google.com/maps?q=30.7318009,76.6951196&z=16&output=embed";

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { toast } = useToast();

  useEffect(() => {
    if (window.location.hash === "#contact-section") {
      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const onSubmit = (data: any) => {
    console.log(data);
    toast({
      title: "Message Sent!",
      description: "We've received your message and will get back to you shortly.",
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div id="contact-section" className="max-w-6xl mx-auto scroll-mt-24">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Visit Krishna Electronics</h1>
            <p className="mt-3 text-gray-600">Have a question or want to visit our store? We're here to help.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)] gap-8 items-start">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-7 text-primary">Get in Touch</h2>
              
              <div className="space-y-7 text-gray-700">
                <div className="flex items-start gap-4">
                  <MapPin className="text-secondary mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Store Location</p>
                    <p className="mt-2 leading-6">Shop No. 182,<br />Sector 119,<br />Dashmesh Market,<br />Balongi,<br />Sahibzada Ajit Singh Nagar,<br />Punjab - 160055, India</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="text-secondary shrink-0" />
                  <div><p className="font-semibold text-gray-900">Phone</p><p className="mt-1"><a href="tel:+919814193459" className="hover:text-secondary cursor-pointer transition-colors">+91 98141 93459</a></p></div>
                </div>
                <div className="flex items-center gap-4">
                  <MessageCircle className="text-secondary shrink-0" />
                  <div><p className="font-semibold text-gray-900">WhatsApp</p><p className="mt-1"><a href="https://wa.me/919814193459" target="_blank" rel="noopener noreferrer" className="hover:text-secondary cursor-pointer transition-colors">Chat with us on WhatsApp</a></p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="text-secondary mt-1 shrink-0" />
                  <div><p className="font-semibold text-gray-900">Store Hours</p><p className="mt-1">Monday - Sunday<br />10:00 AM - 10:00 PM</p></div>
                </div>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 bg-white">
                <iframe
                  title="Krishna Electronics store location"
                  src={mapEmbedUrl}
                  className="w-full h-[350px] md:h-[500px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 font-bold text-primary transition-colors hover:bg-secondary/90"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </div>

          <div className="mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input {...register("firstName", { required: true })} placeholder="Jiya" />
                    {errors.firstName && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input {...register("lastName", { required: true })} placeholder="Agnihotri" />
                    {errors.lastName && <span className="text-red-500 text-xs">Required</span>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} placeholder="jiya@example.in" />
                  {errors.email && <span className="text-red-500 text-xs">Valid email required</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    {...register("message", { required: true })} 
                    placeholder="How can we help you?" 
                    className="min-h-[150px]"
                  />
                  {errors.message && <span className="text-red-500 text-xs">Required</span>}
                </div>

                <Button type="submit" size="lg" className="w-full bg-secondary text-primary font-bold hover:bg-secondary/90">
                  Send Message
                </Button>
              </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
