import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  Users,
  Video,
  Mic,
  MessageSquare,
  CheckCircle2,
  PhoneOff,
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface WaitingSession {
  id: string;
  guest_alias: string;
  session_type: 'video' | 'audio' | 'chat';
  status: string;
  created_at: string;
}

export const CounsellorConsolePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'reports'>('queue');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [waitingSessions, setWaitingSessions] = useState<WaitingSession[]>([]);
  const [studentReports, setStudentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeCallSessionId, setActiveCallSessionId] = useState<string | null>(null);
  const [activeGuestAlias, setActiveGuestAlias] = useState<string | null>(null);
  const [activeSessionType, setActiveSessionType] = useState<string>('video');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; timestamp: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  const counsellorLocalVideoRef = useRef<HTMLVideoElement | null>(null);
  const counsellorRemoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const counsellorLocalStreamRef = useRef<MediaStream | null>(null);
  const counsellorPcRef = useRef<RTCPeerConnection | null>(null);
  const counsellorWsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadConsoleData();
    const interval = setInterval(loadConsoleData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConsoleData = async () => {
    try {
      const qRes = await api.getWaitingSessions();
      setWaitingSessions(qRes.sessions || []);
      const rRes = await api.getCounsellorRequests();
      setStudentReports(rRes.requests || []);
    } catch (err: any) {
      console.warn('Console update polling failed:', err);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await api.updateCounsellorAvailability(!isAvailable);
      setIsAvailable(res.isAvailable);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAcceptSession = async (session: WaitingSession) => {
    setError(null);
    setLoading(true);
    try {
      await api.acceptSession(session.id);
      setActiveCallSessionId(session.id);
      setActiveGuestAlias(session.guest_alias);
      setActiveSessionType(session.session_type);

      let localStream: MediaStream | null = null;
      if (session.session_type === 'video' || session.session_type === 'audio') {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: session.session_type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false
          });
          counsellorLocalStreamRef.current = localStream;
          if (counsellorLocalVideoRef.current && session.session_type === 'video') {
            counsellorLocalVideoRef.current.srcObject = localStream;
          }
        } catch (mErr) {
          console.warn('Counsellor camera not accessible:', mErr);
        }
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      counsellorWsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'join-room',
          sessionId: session.id,
          role: 'counsellor',
          alias: 'Dr. Evelyn Reed'
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'offer') {
            await handleOfferFromGuest(session.id, data.sdp);
          } else if (data.type === 'answer') {
            if (counsellorPcRef.current) {
              await counsellorPcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
          } else if (data.type === 'ice-candidate') {
            if (counsellorPcRef.current && data.candidate) {
              await counsellorPcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } else if (data.type === 'chat-message') {
            setChatMessages(prev => [...prev, {
              sender: data.sender,
              text: data.text,
              timestamp: data.timestamp
            }]);
          } else if (data.type === 'peer-left') {
            handleEndSession();
          }
        } catch (err) {
          console.error('Counsellor WS error:', err);
        }
      };

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      counsellorPcRef.current = pc;

      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream!));
      }

      pc.ontrack = (event) => {
        if (counsellorRemoteVideoRef.current && event.streams[0]) {
          counsellorRemoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'ice-candidate',
            sessionId: session.id,
            candidate: event.candidate
          }));
        }
      };

    } catch (err: any) {
      setError(err.message || 'Failed to accept session.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferFromGuest = async (sessId: string, sdp: any) => {
    if (!counsellorPcRef.current) return;
    const pc = counsellorPcRef.current;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (counsellorWsRef.current?.readyState === WebSocket.OPEN) {
      counsellorWsRef.current.send(JSON.stringify({
        type: 'answer',
        sessionId: sessId,
        sdp: answer
      }));
    }
  };

  const handleSendCounsellorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeCallSessionId) return;

    const newMsg = {
      sender: 'Dr. Evelyn Reed',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (counsellorWsRef.current?.readyState === WebSocket.OPEN) {
      counsellorWsRef.current.send(JSON.stringify({
        type: 'chat-message',
        sessionId: activeCallSessionId,
        ...newMsg
      }));
    }

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const handleEndSession = async () => {
    if (counsellorLocalStreamRef.current) {
      counsellorLocalStreamRef.current.getTracks().forEach(t => t.stop());
      counsellorLocalStreamRef.current = null;
    }
    if (counsellorPcRef.current) {
      counsellorPcRef.current.close();
      counsellorPcRef.current = null;
    }
    if (counsellorWsRef.current) {
      counsellorWsRef.current.close();
      counsellorWsRef.current = null;
    }
    if (activeCallSessionId) {
      await api.endSession(activeCallSessionId).catch(() => {});
    }

    setActiveCallSessionId(null);
    setActiveGuestAlias(null);
    loadConsoleData();
  };

  const handleUpdateRequest = async (reqId: number, status: string, notes: string) => {
    try {
      await api.updateCounsellingRequest(reqId, { status, notes });
      loadConsoleData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        
        {/* Header */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                CAMPUS WELLNESS OFFICER
              </span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Counsellor Operations Console
            </h1>
            <p className="text-sm text-[#9E9EA4] font-light">
              Dr. Evelyn Reed, Ph.D. · Room 204 Wellness Centre
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              <span className="text-[#8E8E93]">STATUS:</span>
              <span className={`font-semibold ${isAvailable ? 'text-[#E50914]' : 'text-[#71717A]'}`}>
                {isAvailable ? 'ONLINE & READY' : 'OFFLINE'}
              </span>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isAvailable
                  ? 'bg-[#E50914] text-white hover:bg-[#c20811] shadow-md'
                  : 'bg-[#17181F] text-[#8E8E93] border border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {isAvailable ? 'Set as Away' : 'Set as Available'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Call Stage if in Call */}
        {activeCallSessionId && (
          <div className="bg-[#111216] border border-[#E50914]/50 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-xs text-[#E50914] uppercase tracking-wider font-semibold block mb-0.5">
                  LIVE WEBRTC SESSION ACTIVE
                </span>
                <h2 className="font-['Outfit'] text-2xl font-bold text-white">
                  Consulting with {activeGuestAlias} ({activeSessionType.toUpperCase()})
                </h2>
              </div>
              <button
                onClick={handleEndSession}
                className="px-5 py-2.5 bg-[#E50914] hover:bg-[#c20811] text-white font-mono text-xs uppercase tracking-wider rounded-full flex items-center gap-2 cursor-pointer shadow-md"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Conclude Call</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 bg-[#17181F] border border-white/10 rounded-2xl min-h-[320px] relative flex items-center justify-center text-white overflow-hidden">
                <video
                  ref={counsellorRemoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[320px] object-cover rounded-xl"
                />
                <div className="absolute bottom-3 right-3 w-28 h-20 bg-black rounded-xl border border-[#E50914]/50 overflow-hidden shadow-lg">
                  <video
                    ref={counsellorLocalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-5 bg-[#17181F] border border-white/10 rounded-2xl flex flex-col h-[320px] overflow-hidden">
                <div className="p-3 bg-[#111216] border-b border-white/10 font-mono text-xs text-[#E50914] uppercase font-semibold">
                  Chat with {activeGuestAlias}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.sender === 'Dr. Evelyn Reed' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-[#71717A] mb-0.5">{m.sender} · {m.timestamp}</span>
                      <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                        m.sender === 'Dr. Evelyn Reed'
                          ? 'bg-[#E50914] text-white font-medium'
                          : 'bg-[#111216] border border-white/10 text-white'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendCounsellorMessage} className="p-2.5 border-t border-white/10 bg-[#111216] flex gap-2 font-mono">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type reply..."
                    className="flex-1 px-3 py-1.5 bg-[#17181F] border border-white/10 rounded-lg text-white text-xs outline-none focus:border-[#E50914]"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-[#E50914] text-white rounded-lg font-mono text-xs uppercase hover:bg-[#c20811]">
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-2.5 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Anonymous Waiting Queue ({waitingSessions.filter(s => s.status === 'waiting').length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2.5 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Summarized Stress Reports ({studentReports.length})
          </button>
        </div>

        {/* TAB 1: Queue */}
        {activeTab === 'queue' && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-[2px] bg-[#E50914]" />
                  <h2 className="font-['Outfit'] text-xl font-bold text-white">
                    Live Anonymous Sessions Queue
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#8E8E93]">
                  Students waiting in encrypted queue without account identity.
                </p>
              </div>
              <button
                onClick={loadConsoleData}
                className="font-mono text-xs text-[#E50914] uppercase tracking-wider hover:underline flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {waitingSessions.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[#8E8E93]">
                No anonymous students currently waiting in queue.
              </div>
            ) : (
              <div className="divide-y divide-white/5 font-mono text-xs">
                {waitingSessions.map((s) => (
                  <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-sm">{s.guest_alias}</span>
                        <span className="text-white/20">|</span>
                        <span className="capitalize text-[#E50914] font-semibold">{s.session_type} Comm</span>
                        <span className="text-white/20">|</span>
                        <span className="text-[#8E8E93] text-xs">
                          {new Date(s.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A]">ROOM ID: {s.id}</p>
                    </div>

                    <button
                      onClick={() => handleAcceptSession(s)}
                      disabled={loading || activeCallSessionId !== null}
                      className="px-5 py-2.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full font-mono text-xs uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-2 self-start sm:self-auto"
                    >
                      <span>Connect with Student</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Formal Reports */}
        {activeTab === 'reports' && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="pb-4 border-b border-white/10 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-[#E50914]" />
                <h2 className="font-['Outfit'] text-xl font-bold text-white">
                  Summarized Student Stress Reports
                </h2>
              </div>
              <p className="font-mono text-xs text-[#8E8E93]">
                Submitted by high-stress assessments. Individual Yes/No answers withheld.
              </p>
            </div>

            {studentReports.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[#8E8E93]">
                No student referral reports filed.
              </div>
            ) : (
              <div className="space-y-4">
                {studentReports.map((r) => {
                  let parsed: any = null;
                  try { parsed = JSON.parse(r.summary); } catch {}

                  return (
                    <div key={r.id} className="p-5 bg-[#17181F] border border-white/5 rounded-2xl space-y-3.5 font-mono text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-sm">{r.student_name}</span>
                          <span className="text-[#8E8E93]">({r.course} · {r.academic_year})</span>
                        </div>
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateRequest(r.id, e.target.value, r.notes || '')}
                          className="px-3 py-1 bg-[#111216] border border-white/10 rounded-lg text-[#E50914] font-semibold text-xs uppercase outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      {parsed && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#8E8E93]">
                          <div>AREA: <span className="text-white font-medium ml-1">{parsed.stressArea}</span></div>
                          <div>LEVEL: <span className="text-[#E50914] font-medium ml-1">{parsed.stressLevel}</span></div>
                          <div>SCORE: <span className="text-white font-medium ml-1">{parsed.totalScore}/40</span></div>
                          <div>FACTORS: <span className="text-white ml-1">{parsed.contributingFactors?.join(', ')}</span></div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                        <input
                          type="text"
                          defaultValue={r.notes || ''}
                          placeholder="Add counsellor intervention notes..."
                          onBlur={(e) => handleUpdateRequest(r.id, r.status, e.target.value)}
                          className="flex-1 px-3.5 py-2 bg-[#111216] border border-white/10 rounded-xl text-white text-xs outline-none focus:border-[#E50914]"
                        />
                        <span className="text-[11px] text-[#71717A]">Auto-saves on blur</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
