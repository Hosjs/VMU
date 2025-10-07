import { useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

export default function Settings() {
  const [settings, setSettings] = useState({
    company_name: 'Thắng Trường Auto Service',
    company_email: 'info@thangtruong.com',
    company_phone: '0987654321',
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cài đặt hệ thống</h1>
      <Card title="Thông tin công ty">
        <div className="space-y-4">
          <Input label="Tên công ty" value={settings.company_name} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} />
          <Input label="Email" type="email" value={settings.company_email} onChange={(e) => setSettings({ ...settings, company_email: e.target.value })} />
          <Input label="Số điện thoại" value={settings.company_phone} onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })} />
          <Button variant="primary">💾 Lưu cài đặt</Button>
        </div>
      </Card>
    </div>
  );
}

