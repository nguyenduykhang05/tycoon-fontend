import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface SpaService {
    id: number;
    name: string;
    category: string;
    price: number;
    duration_minutes: number;
    description?: string;
}

interface Store {
    id: number;
    name: string;
    address: string;
}

export default function SpaPage({ user }: { user: any }) {
    const [services, setServices] = useState<SpaService[]>([]);
    const [branches, setBranches] = useState<Store[]>([]);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [bookingTime, setBookingTime] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch services
        fetch('/api/spa/services')
            .then(res => res.json())
            .then(data => {
                if (data.success) setServices(data.data);
            })
            .catch(err => console.error('Error fetching spa services:', err));

        // Fetch stores/branches
        fetch('/api/stores')
            .then(res => res.json())
            .then(data => {
                if (data.success) setBranches(data.data);
            })
            .catch(err => console.error('Error fetching stores:', err));
    }, []);

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Vui lòng đăng nhập để đặt lịch');
            return;
        }
        if (!selectedService || !bookingTime || !selectedBranch) {
            alert('Vui lòng chọn đầy đủ dịch vụ, chi nhánh và thời gian');
            return;
        }

        setIsSubmitting(true);
        fetch('/api/spa/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                service_id: selectedService,
                branch_id: selectedBranch,
                booking_time: bookingTime
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Đặt lịch Spa thành công! Chúng tôi sẽ liên hệ lại sớm.');
                    setSelectedService(null);
                    setSelectedBranch(null);
                    setBookingTime('');
                } else {
                    alert('Có lỗi xảy ra: ' + data.message);
                }
            })
            .finally(() => setIsSubmitting(false));
    };

    const categories = Array.from(new Set(services.map(s => s.category)));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2.5rem] p-10 mb-10 border border-emerald-100 flex items-center justify-between shadow-soft">
                <div className="max-w-xl">
                    <h1 className="text-[32px] font-black text-[#005a31] uppercase mb-4 tracking-tight">Tycoon Clinic & Spa</h1>
                    <p className="text-gray-600 mb-8 text-lg">Trải nghiệm không gian làm đẹp sang trọng, đẳng cấp với các dịch vụ chăm sóc sắc đẹp chuyên sâu từ đội ngũ chuyên gia hàng đầu.</p>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-[14px] font-bold text-[#005a31] bg-white/50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                            <CheckCircle size={18} /> Công nghệ hiện đại
                        </div>
                        <div className="flex items-center gap-2 text-[14px] font-bold text-[#005a31] bg-white/50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                            <CheckCircle size={18} /> Chuyên gia tư vấn
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {categories.map(cat => (
                        <div key={cat}>
                            <h2 className="text-[20px] font-bold text-gray-800 mb-4 capitalize border-b pb-2">{cat}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.filter(s => s.category === cat).map(service => (
                                    <div
                                        key={service.id}
                                        onClick={() => setSelectedService(service.id)}
                                        className={`p-5 rounded-[2rem] border cursor-pointer transition-soft flex flex-col justify-between ${selectedService === service.id ? 'border-[#005a31] bg-emerald-50/50 shadow-soft ring-1 ring-[#005a31]' : 'border-gray-100 bg-white hover:border-[#005a31] hover:shadow-soft'}`}
                                    >
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-[15px] mb-1">{service.name}</h4>
                                            <div className="flex items-center gap-1.5 text-gray-500 text-[13px] mb-2">
                                                <Clock size={14} /> {service.duration_minutes} phút
                                            </div>
                                            {service.description && (
                                                <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed italic">{service.description}</p>
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-black text-[#ff6b00]">{service.price.toLocaleString('vi-VN')} đ</span>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedService === service.id ? 'bg-[#005a31] border-[#005a31]' : 'border-gray-300'}`}>
                                                {selectedService === service.id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8 sticky top-[120px]">
                        <h3 className="font-bold text-[18px] text-gray-800 uppercase mb-6 flex items-center gap-2">
                            <Calendar className="text-[#005a31]" /> Đặt lịch hẹn
                        </h3>

                        <form onSubmit={handleBooking} className="space-y-5">
                            {!user && (
                                <div className="bg-orange-50 text-orange-800 p-3 rounded text-[13px] font-medium border border-orange-100">
                                    Vui lòng đăng nhập để đặt lịch Spa.
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-gray-700">Dịch vụ đã chọn</label>
                                {selectedService ? (
                                    <div className="bg-gray-50 p-3 rounded border text-[14px] font-medium text-[#005a31]">
                                        {services.find(s => s.id === selectedService)?.name}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-3 rounded border text-[14px] text-gray-400 italic">
                                        Chưa chọn dịch vụ
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-gray-700">Chi nhánh (Branch)</label>
                                <select 
                                    className="w-full border border-gray-200 bg-gray-50 rounded-full p-3.5 px-5 text-[14px] focus:outline-none focus:border-[#005a31] appearance-none"
                                    value={selectedBranch || ''}
                                    onChange={(e) => setSelectedBranch(Number(e.target.value))}
                                    required
                                >
                                    <option value="" disabled>Chọn chi nhánh Tycoon gần bạn</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} - {b.address}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-gray-700">Thời gian (Booking Time)</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-full p-3.5 px-5 text-[14px] focus:outline-none focus:border-[#005a31]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!user || isSubmitting}
                                className={`w-full py-4 rounded-full font-bold uppercase transition-soft shadow-soft ${!user || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#005a31] text-white hover:bg-emerald-800'}`}
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
