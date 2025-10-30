export interface Grade {
  MaLopHoc: string;
  TenLopHoc: string;
  hocPhanChu: string;
  tenMon: string;
  soTinChiThucHoc: number;
  diem: number;
  HeSo: number;
  DiemHe4: number;
  GhiChu: string;
}

export function adaptGradeApi(item: any): Grade {
  return {
    MaLopHoc: item.MaLopHoc || '',
    TenLopHoc: item.TenLopHoc || '',
    hocPhanChu: item.hocPhanChu || '',
    tenMon: item.tenMon || '',
    soTinChiThucHoc: typeof item.soTinChiThucHoc === 'number' ? item.soTinChiThucHoc : (typeof item.soTinChi === 'number' ? item.soTinChi : 0),
    diem: typeof item.diem === 'number' ? item.diem : 0,
    HeSo: typeof item.HeSo === 'number' ? item.HeSo : 0,
    DiemHe4: typeof item.DiemHe4 === 'number' ? item.DiemHe4 : 0,
    GhiChu: item.ghiChu || item.GhiChu || '',
  };
}
