import React, { useMemo, useState } from "react";
import logo from "./logo.svg";

export default function Home() {
  // ---- Global UI State ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showMockCheckout, setShowMockCheckout] = useState(false);
  const [errors, setErrors] = useState({});
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // ---- Business Config ----
  const BUSINESS_NAME = "Snowbird Vehicle Watch & Care";
  const BUSINESS_EMAIL = "Jobeydillon@Snowbirdvehiclewatch.com"; // public email
  const SERVICE_AREAS = [
    "Phoenix",
    "Scottsdale",
    "Tempe",
    "Mesa",
    "Chandler",
    "Gilbert",
    "Glendale",
    "Peoria",
    "Surprise",
    "Fountain Hills",
  ];
  const ONBOARDING_FEE = 50; // USD
  const AZ_TAX_RATE = 0.086; // 8.6% (adjust to your registered rate)
  const BILLING_MODEL = "Monthly auto-renew";

  // ---- Plan Catalog (Preserve removed) ----
  const plans = useMemo(
    () => ([
      {
        name: "Basic",
        price: 120,
        bullets: [
          "Monthly vehicle start",
          "Basic battery & tire check",
          "Email report",
        ],
      },
      {
        name: "Standard",
        price: 200,
        bullets: [
          "Bi-weekly starts",
          "Optional short drives",
          "Battery, tire, fluid checks",
          "Text & photo updates",
        ],
      },
      {
        name: "Premium",
        price: 250,
        bullets: [
          "Weekly starts",
          "Optional drives by professional driver",
          "Battery test; tire & fluid checks",
          "Detailed health report with photos",
        ],
      },
    ]),
    []
  );

  const priceFor = (planName) => plans.find((p) => p.name === planName)?.price ?? 0;

  // ---- Lead Form State ----
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    licensePlate: "",
    startDate: "",
    accessMethod: "Key handoff",
    addressOrLocation: "",
    notes: "",
    promoCode: "",
  });

  // ---- Smooth scroll helpers ----
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleNavClick = (e, id) => {
    e.preventDefault();
    scrollToId(id);
  };

  // ---- CTA Handlers ----
  const handleSubscribe = (planName) => {
    setSelectedPlan(planName);
    setSubmitted(false);
    setShowMockCheckout(false);
    setIsModalOpen(true);
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ---- Validation ----
  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!/^[0-9+()\-\s]{7,}$/.test(form.phone)) newErrors.phone = "Enter a valid phone";
    if (!form.startDate) newErrors.startDate = "Pick a start date";
    return newErrors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      setSubmitted(true);
    }
  };

  // ---- Email Prefill ----
  const mailtoHref = () => {
    const subject = encodeURIComponent(`New signup: ${selectedPlan}`);
    const body = encodeURIComponent(
      [
        `Plan: ${selectedPlan}`,
        `Name: ${form.fullName}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Vehicle: ${form.vehicleYear} ${form.vehicleMake} ${form.vehicleModel}`,
        `Plate: ${form.licensePlate}`,
        `Service start: ${form.startDate}`,
        `Access: ${form.accessMethod}`,
        `Location: ${form.addressOrLocation}`,
        `Promo code: ${form.promoCode || '—'}`,
        `Notes: ${form.notes}`,
      ].join("\n")
    );
    return `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  };

  // ---- Mock Checkout calc ----
  const promo = useMemo(() => {
    const code = (form.promoCode || "").trim().toUpperCase();
    if (!code) return { code: "", type: "none", amountOff: 0, percentOff: 0 };
    // Example promos (edit freely):
    if (code === "WELCOME10") return { code, type: "percent", percentOff: 10, amountOff: 0 };
    if (code === "SAVE25") return { code, type: "amount", amountOff: 25, percentOff: 0 };
    return { code, type: "invalid", amountOff: 0, percentOff: 0 };
  }, [form.promoCode]);

  const checkout = useMemo(() => {
    const planPrice = priceFor(selectedPlan);
    let subtotal = planPrice + ONBOARDING_FEE; // first month includes onboarding
    let discount = 0;
    if (promo.type === "percent") discount = (subtotal * promo.percentOff) / 100;
    if (promo.type === "amount") discount = Math.min(promo.amountOff, subtotal);
    const afterDiscount = Math.max(subtotal - discount, 0);
    const tax = +(afterDiscount * AZ_TAX_RATE).toFixed(2);
    const total = +(afterDiscount + tax).toFixed(2);
    return { planPrice, onboarding: ONBOARDING_FEE, subtotal, discount, afterDiscount, tax, total };
  }, [selectedPlan, promo]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Snowbird logo" className="h-9 w-auto" />
            <h1 className="text-2xl font-bold text-navy">{BUSINESS_NAME}</h1>
          </div>
          <nav className="space-x-6 text-gray-600 font-medium">
            <a href="#services" onClick={(e)=>handleNavClick(e,'services')} className="hover:text-navy">Services</a>
            <a href="#pricing" onClick={(e)=>handleNavClick(e,'pricing')} className="hover:text-navy">Pricing</a>
            <a href="#areas" onClick={(e)=>handleNavClick(e,'areas')} className="hover:text-navy">Service Area</a>
            <a href="#faq" onClick={(e)=>handleNavClick(e,'faq')} className="hover:text-navy">FAQ</a>
            <a href="#contact" onClick={(e)=>handleNavClick(e,'contact')} className="hover:text-navy">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-navy text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Peace of Mind for Your Car While You’re Away</h2>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Monthly vehicle management for Phoenix snowbirds and seasonal travelers. We keep your car running, charged, and ready when you return.
        </p>
        <a
          href="#pricing"
          onClick={(e)=>handleNavClick(e,'pricing')}
          className="bg-white text-navy px-6 py-3 rounded-2xl font-semibold shadow hover:bg-gray-100 transition inline-block"
        >
          View Plans
        </a>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h4 className="text-xl font-semibold mb-3">Vehicle Starts & Drives</h4>
            <p>Regular starts and optional short drives to keep fluids moving and the battery charged.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h4 className="text-xl font-semibold mb-3">Basic Checkups</h4>
            <p>Tires, fluids, and battery health checks with a quick report after each visit.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h4 className="text-xl font-semibold mb-3">Premium Care</h4>
            <p>White-glove attention and detailed reporting to keep your vehicle in peak condition.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Simple Monthly Plans</h3>
          <p className="text-center text-sm text-gray-600 -mt-8 mb-10">Billing: {BILLING_MODEL}. First visit includes a one-time onboarding fee of ${ONBOARDING_FEE}.</p>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl shadow-md p-8 text-center flex flex-col h-full">
                <h4 className="text-xl font-semibold mb-3">{p.name}</h4>
                <p className="text-4xl font-bold mb-4">${p.price}<span className="text-lg">/mo</span></p>
                <ul className="mb-6 space-y-2 text-gray-600">
                  {p.bullets.map((b, i) => (
                    <li key={i}>✔ {b}</li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(p.name)} className="bg-navy text-white px-6 py-3 rounded-2xl font-semibold shadow hover:bg-navy transition mt-auto">Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section id="areas" className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-8">Service Area</h3>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-6">We serve Phoenix and nearby cities. Travel fees may apply outside the primary service area.</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {SERVICE_AREAS.map((city) => (
            <span key={city} className="px-3 py-1 rounded-full bg-white shadow text-gray-700 border">{city}</span>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-8">FAQ</h3>
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="bg-white rounded-xl shadow p-4">
            <summary className="font-semibold cursor-pointer">Do you store vehicles?</summary>
            <p className="mt-2 text-gray-700">No. We do not store vehicles.</p>
          </details>
          <details className="bg-white rounded-xl shadow p-4">
            <summary className="font-semibold cursor-pointer">Can I pause or cancel?</summary>
            <p className="mt-2 text-gray-700">Yes—cancel anytime before your next billing cycle. Refunds for the current month are not guaranteed once service begins.</p>
          </details>
          <details className="bg-white rounded-xl shadow p-4">
            <summary className="font-semibold cursor-pointer">Insurance & drivers</summary>
            <p className="mt-2 text-gray-700">Business and drivers will be insured. Professional drivers are vetted with clean records. Full policy details will be posted upon activation.</p>
          </details>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-navy text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6">Get In Touch</h3>
          <p className="mb-6">Questions or ready to sign up? Reach out today!</p>
          <a href={`mailto:${BUSINESS_EMAIL}`} className="bg-white text-navy px-6 py-3 rounded-2xl font-semibold shadow hover:bg-gray-100 transition inline-block">
            Email Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-600">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
          <div className="space-x-4">
            <button onClick={() => setTermsOpen(true)} className="underline hover:text-gray-800">Terms</button>
            <button onClick={() => setPrivacyOpen(true)} className="underline hover:text-gray-800">Privacy</button>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h4 className="text-xl font-bold">Sign up for {selectedPlan}</h4>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {/* Form / Success Steps */}
            {!submitted ? (
              <form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full name</label>
                    <input name="fullName" value={form.fullName} onChange={onChange} className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Jane Doe" />
                    {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={onChange} className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="you@email.com" />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input name="phone" value={form.phone} onChange={onChange} className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="(555) 555-5555" />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service start date</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={onChange} className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <input name="vehicleYear" value={form.vehicleYear} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="2021" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Make</label>
                    <input name="vehicleMake" value={form.vehicleMake} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Toyota" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input name="vehicleModel" value={form.vehicleModel} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="RAV4" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plate</label>
                    <input name="licensePlate" value={form.licensePlate} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="ABC123" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Access method</label>
                    <select name="accessMethod" value={form.accessMethod} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                      <option>Key handoff</option>
                      <option>Lockbox</option>
                      <option>Hidden key</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vehicle location / address</label>
                    <input name="addressOrLocation" value={form.addressOrLocation} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Community + address or notes" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Promo code</label>
                    <input name="promoCode" value={form.promoCode} onChange={onChange} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="WELCOME10 or SAVE25 (demo)" />
                  </div>
                  <div className="flex items-end text-xs text-gray-500">
                    First month includes ${ONBOARDING_FEE} onboarding; tax calculated at checkout.
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={onChange} rows={3} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Anything else we should know?" />
                </div>

                <p className="text-xs text-gray-500">
                  By submitting, you agree we do <span className="font-semibold">not store vehicles</span>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-navy text-white font-semibold hover:bg-navy shadow">Continue</button>
                </div>
              </form>
            ) : (
              <div className="px-6 py-8 space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4">
                  <p className="font-semibold">Looks good!</p>
                  <p>We captured your {selectedPlan} signup details.</p>
                </div>

                {/* Mock Checkout */}
                <div className="rounded-2xl border border-gray-200 p-4">
                  <h5 className="font-semibold mb-2">Checkout (demo)</h5>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Plan: <span className="font-medium">{selectedPlan}</span> — ${priceFor(selectedPlan)}/mo</p>
                    <p>Onboarding: ${ONBOARDING_FEE}.00 (one-time, first month)</p>
                    {promo.type === "percent" && <p>Promo ({promo.code}): −{promo.percentOff}%</p>}
                    {promo.type === "amount" && <p>Promo ({promo.code}): −${promo.amountOff}</p>}
                    {promo.type === "invalid" && <p className="text-red-600">Promo ({promo.code}) not recognized</p>}
                    <p>Subtotal: ${checkout.subtotal.toFixed(2)}</p>
                    <p>Discount: −${checkout.discount.toFixed(2)}</p>
                    <p>Tax (AZ {Math.round(AZ_TAX_RATE * 1000) / 10}%): ${checkout.tax.toFixed(2)}</p>
                    <p className="font-semibold">Total due today: ${checkout.total.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button className="px-5 py-2 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 shadow" onClick={() => setShowMockCheckout(true)}>
                      Continue to Stripe (demo)
                    </button>
                    <a href={mailtoHref()} className="px-5 py-2 rounded-xl bg-navy text-white font-semibold hover:bg-navy shadow text-center">
                      Email me a confirmation
                    </a>
                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                      Close
                    </button>
                  </div>
                  {showMockCheckout && (
                    <p className="text-xs text-gray-500 mt-3">In production, this button calls your backend to create a Stripe Checkout Session and redirects with your publishable key. Promo codes can be passed to Stripe as <code>discounts</code>.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {termsOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 grid place-items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h4 className="text-lg font-bold">Terms of Service</h4>
              <button onClick={() => setTermsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-3 text-sm text-gray-700">
              <p>Billing is monthly and auto-renews until canceled. Cancel any time before your next billing cycle to avoid future charges.</p>
              <p>First visit includes a one-time ${ONBOARDING_FEE} onboarding fee. Travel fees may apply outside the primary service area.</p>
              <p>Services are for vehicle wellness (starts, checks, optional short drives) and do not include storage.</p>
            </div>
            <div className="px-6 py-4 border-t text-right">
              <button onClick={() => setTermsOpen(false)} className="px-5 py-2 rounded-xl bg-navy text-white font-semibold hover:bg-navy shadow">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {privacyOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 grid place-items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h4 className="text-lg font-bold">Privacy Policy</h4>
              <button onClick={() => setPrivacyOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-3 text-sm text-gray-700">
              <p>We collect contact and vehicle details you provide to schedule service. We do not sell your data. Email {BUSINESS_EMAIL} to request deletion.</p>
              <p>Payment processing will be handled by Stripe. We do not store full card details on our servers.</p>
            </div>
            <div className="px-6 py-4 border-t text-right">
              <button onClick={() => setPrivacyOpen(false)} className="px-5 py-2 rounded-xl bg-navy text-white font-semibold hover:bg-navy shadow">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
