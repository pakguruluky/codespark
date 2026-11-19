import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi kesalahan yang tidak terduga.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('CodeSpark ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
          <div className="neo-card max-w-lg w-full p-6 sm:p-8 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FB7185] border-2 border-black flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-black" />
              </div>
              <h1 className="font-display text-2xl font-extrabold">Terjadi Gangguan Sistem</h1>
            </div>
            <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
              Aplikasi mendeteksi kesalahan saat memproses data. Anda dapat memuat ulang halaman untuk kembali belajar.
            </p>
            <div className="p-3 bg-[#FFFDF7] border-2 border-black font-mono text-xs break-all mb-6 max-h-36 overflow-y-auto">
              {this.state.errorMessage}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="neo-btn bg-[#FFE600] px-5 py-2.5 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
