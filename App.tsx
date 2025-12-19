
import React, { useState, useEffect, useRef } from 'react';
import { RoadmapItem, Status, Priority, ProjectInfo, ProductTrack } from './types';
// Fixed: Added CalendarIcon to the imports from ./components/Icons
import { PlusIcon, TrashIcon, PencilIcon, CalendarIcon } from './components/Icons';

const DAYS_IN_WEEK = 7;
const TOTAL_WEEKS = 5; // Atualizado para 5 semanas
const TOTAL_DAYS = DAYS_IN_WEEK * TOTAL_WEEKS;
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const INITIAL_PROJECT: ProjectInfo = {
  name: "Roadmap BLINK",
  description: "Planejamento mensal detalhado por produto e semana.",
  tracks: [
    {
      id: generateId(),
      name: "Produto Alpha",
      items: [
        {
          id: generateId(),
          title: "Pesquisa Inicial",
          description: "Levantamento de requisitos",
          startDay: 1,
          duration: 5,
          status: Status.COMPLETED,
          priority: Priority.HIGH
        }
      ]
    }
  ],
  logo: undefined
};

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectInfo>(() => {
    const saved = localStorage.getItem('roadmap_v3_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.tracks)) return parsed;
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      }
    }
    return INITIAL_PROJECT;
  });

  const [editingItem, setEditingItem] = useState<{trackId: string, item: RoadmapItem} | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  
  // Novo estado para controle de exclusão de trilha
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('roadmap_v3_data', JSON.stringify(project));
  }, [project]);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProject(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProject(prev => ({ ...prev, logo: undefined }));
  };

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrackName.trim()) {
      const newTrack: ProductTrack = {
        id: generateId(),
        name: newTrackName.trim(),
        items: []
      };
      setProject(prev => ({
        ...prev,
        tracks: [...prev.tracks, newTrack]
      }));
      setNewTrackName("");
      setIsTrackModalOpen(false);
    }
  };

  const confirmDeleteTrack = () => {
    if (trackToDelete) {
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackToDelete)
      }));
      setTrackToDelete(null);
    }
  };

  const openAddItem = (trackId: string) => {
    const newItem: RoadmapItem = {
      id: generateId(),
      title: 'Novo Marco',
      description: '',
      startDay: 1,
      duration: 3,
      status: Status.PLANNED,
      priority: Priority.MEDIUM
    };
    setEditingItem({ trackId, item: newItem });
    setIsItemModalOpen(true);
  };

  const handleEditItem = (trackId: string, item: RoadmapItem) => {
    setEditingItem({ trackId, item: { ...item } });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => {
        if (t.id === editingItem.trackId) {
          const exists = t.items.find(i => i.id === editingItem.item.id);
          return {
            ...t,
            items: exists 
              ? t.items.map(i => i.id === editingItem.item.id ? editingItem.item : i)
              : [...t.items, editingItem.item]
          };
        }
        return t;
      })
    }));
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (trackId: string, itemId: string) => {
    if (window.confirm("Deseja excluir este marco?")) {
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === trackId ? { ...t, items: t.items.filter(i => i.id !== itemId) } : t)
      }));
      setIsItemModalOpen(false);
      setEditingItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-40 gap-4 shadow-sm">
        <div className="flex items-center gap-6 flex-1 w-full">
          {/* Logo Upload Area (Visualmente quadrada para acomodar logos) */}
          <div 
            onClick={handleLogoClick}
            className="group relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden shrink-0"
            title="Clique para enviar a logo da empresa (recomendado 600x600px)"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              className="hidden" 
              accept="image/*"
            />
            {project.logo ? (
              <>
                <img src={project.logo} alt="Logo" className="w-full h-full object-contain" />
                <button 
                  onClick={handleRemoveLogo}
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all text-slate-400"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-slate-300 group-hover:text-indigo-400">
                <PlusIcon className="w-6 h-6 md:w-8 md:h-8" />
                <span className="text-[9px] font-bold uppercase mt-1">Logo</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full text-left">
            <input 
              className="text-2xl font-bold bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder-slate-300 text-left"
              value={project.name}
              onChange={e => setProject(prev => ({...prev, name: e.target.value}))}
              placeholder="Nome do Projeto"
            />
            <p className="text-slate-400 text-sm">Planejamento Visual Mensal (5 Semanas)</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsTrackModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 self-start md:self-auto"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Produto
        </button>
      </header>

      {/* Main Roadmap Area */}
      <main className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-w-[1400px]">
          {/* Timeline Header */}
          <div className="flex border-b bg-slate-50/50">
            <div className="w-64 border-r p-5 font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center bg-slate-100/30">
              Produtos / Trilhas
            </div>
            <div className="flex-1 grid grid-cols-5">
              {[1, 2, 3, 4, 5].map(w => (
                <div key={w} className="border-r last:border-0">
                  <div className="py-3 text-center font-bold text-slate-500 border-b bg-white uppercase text-[10px] tracking-widest">
                    Semana {w}
                  </div>
                  <div className="grid grid-cols-7">
                    {WEEKDAYS.map((d, idx) => (
                      <div key={idx} className="text-center py-2 text-[9px] font-bold text-slate-300 border-r last:border-0 bg-slate-50/20 uppercase">
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <div className="divide-y divide-slate-100">
            {project.tracks.length === 0 ? (
              <div className="p-24 text-center">
                <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                  <CalendarIcon className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium italic">Nenhum produto cadastrado. Comece adicionando um novo produto no botão acima.</p>
              </div>
            ) : (
              project.tracks.map(track => (
                <div key={track.id} className="flex group min-h-[120px] hover:bg-slate-50/30 transition-colors">
                  <div className="w-64 border-r p-6 flex flex-col justify-center bg-slate-50/30">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm truncate mr-2" title={track.name}>{track.name}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button 
                          onClick={() => openAddItem(track.id)} 
                          className="p-1.5 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm border border-indigo-100 rounded-xl bg-white transition-all active:scale-90" 
                          title="Adicionar Marco"
                        >
                          <PlusIcon className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => setTrackToDelete(track.id)} 
                          className="p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm border border-rose-100 rounded-xl bg-white transition-all active:scale-90" 
                          title="Excluir Produto"
                        >
                          <TrashIcon className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative bg-white">
                    <div className="absolute inset-0 grid grid-cols-35 pointer-events-none">
                      {Array.from({length: 35}).map((_, i) => (
                        <div key={i} className="border-r border-slate-50 h-full"></div>
                      ))}
                    </div>

                    <div className="relative h-full p-6 flex flex-col justify-center space-y-3">
                      {track.items.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleEditItem(track.id, item)}
                          className={`h-10 rounded-xl shadow-sm flex items-center px-4 text-[11px] font-bold cursor-pointer hover:scale-[1.01] hover:ring-2 hover:ring-indigo-400 transition-all truncate border border-black/5
                            ${item.priority === Priority.HIGH ? 'bg-rose-500 text-white' : 
                              item.priority === Priority.MEDIUM ? 'bg-amber-400 text-slate-900' : 
                              item.priority === Priority.LOW ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}
                          style={{
                            marginLeft: `${((item.startDay - 1) / 35) * 100}%`,
                            width: `${(item.duration / 35) * 100}%`
                          }}
                        >
                          {item.title} <span className="ml-1 opacity-80 font-medium">({item.status})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Confirmação de Exclusão de Trilha */}
      {trackToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrashIcon className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Produto?</h3>
              <p className="text-slate-500 text-sm">Esta ação é irreversível e removerá todos os marcos deste produto da sua linha do tempo.</p>
            </div>
            <div className="px-8 py-6 border-t bg-slate-50 flex flex-col gap-3">
              <button 
                onClick={confirmDeleteTrack}
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
              >
                Confirmar Exclusão
              </button>
              <button 
                onClick={() => setTrackToDelete(null)}
                className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                Manter Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Trilha (Produto) */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <form onSubmit={handleAddTrack}>
              <div className="px-8 py-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Novo Produto</h3>
                <button type="button" onClick={() => setIsTrackModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                <input 
                  autoFocus
                  required 
                  className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-medium shadow-sm"
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  placeholder="Ex: App Mobile, Expansão..."
                />
              </div>
              <div className="px-8 py-6 border-t bg-slate-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsTrackModalOpen(false)} className="text-sm font-bold text-slate-500">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200">Criar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Marco */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <form onSubmit={handleSaveItem}>
              <div className="px-8 py-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Editar Marco</h3>
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Título</label>
                  <input 
                    required 
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-medium shadow-sm transition-all"
                    value={editingItem.item.title}
                    onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, title: e.target.value}})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dia de Início (1-35)</label>
                    <input 
                      type="number" min="1" max="35"
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 text-base font-medium shadow-sm"
                      value={editingItem.item.startDay}
                      onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, startDay: parseInt(e.target.value) || 1}})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Duração (Dias)</label>
                    <input 
                      type="number" min="1" max="35"
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 text-base font-medium shadow-sm"
                      value={editingItem.item.duration}
                      onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, duration: parseInt(e.target.value) || 1}})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 text-base font-medium shadow-sm appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                      value={editingItem.item.status}
                      onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, status: e.target.value as Status}})}
                    >
                      {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prioridade</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 text-base font-medium shadow-sm appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                      value={editingItem.item.priority}
                      onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, priority: e.target.value as Priority}})}
                    >
                      {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t bg-slate-50 flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={() => handleDeleteItem(editingItem.trackId, editingItem.item.id)}
                  className="text-rose-500 text-sm font-bold hover:text-rose-600 transition-colors uppercase tracking-tight"
                >
                  Excluir Marco
                </button>
                <div className="flex gap-4 items-center">
                  <button type="button" onClick={() => setIsItemModalOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                  <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all">Salvar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .grid-cols-35 { grid-template-columns: repeat(35, minmax(0, 1fr)); }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
