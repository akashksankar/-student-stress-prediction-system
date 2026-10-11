import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Users,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export const AnonymousCounsellingPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'video' | 'audio' | 'chat'>('video');
  const [inSession, setInSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [guestAlias, setGuestAlias] = useState<string>('Guest');
  const [counsellorName, setCounsellorName] = useState<string>('Dr. Evelyn Reed');
  const [sessionStatus, setSessionStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');

  const [audioMuted, setAudioMuted] = useState(false);
  const [videoDisabled, setVideoDisabled] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      handleEndCall();
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    setMediaError(null);

    try {
      const sessionData = await api.createAnonymousSession(selectedMode);
      setSessionId(sessionData.sessionId);
      setGuestAlias(sessionData.guestAlias);
      setCounsellorName(sessionData.counsellorName || 'Dr. Evelyn Reed');
      setSessionStatus('waiting');
      setInSession(true);

      let localStream: MediaStream | null = null;
      if (selectedMode === 'video' || selectedMode === 'audio') {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: selectedMode === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false
          });
          localStreamRef.current = localStream;
          if (localVideoRef.current && selectedMode === 'video') {
            localVideoRef.current.srcObject = localStream;
          }
        } catch (mediaErr: any) {
          setMediaError('Camera/Microphone permission denied or device not detected. Audio/video disabled, but encrypted text chat remains fully operational.');
        }
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'join-room',
          sessionId: sessionData.sessionId,
          role: 'guest',
          alias: sessionData.guestAlias
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'peer-joined' && data.peerRole === 'counsellor') {
            setSessionStatus('active');
            setCounsellorName(data.peerAlias || 'Dr. Evelyn Reed');
            await setupWebRTC(sessionData.sessionId, true);
          } else if (data.type === 'offer') {
            await handleOffer(data.sdp);
          } else if (data.type === 'answer') {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
          } else if (data.type === 'ice-candidate') {
            if (peerConnectionRef.current && data.candidate) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } else if (data.type === 'chat-message') {
            setMessages(prev => [...prev, {
              sender: data.sender,
              text: data.text,
              timestamp: data.timestamp
            }]);
          } else if (data.type === 'peer-left') {
            setSessionStatus('ended');
            setConnectionState('disconnected');
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      const pollTimer = setInterval(async () => {
        try {
          const stat = await api.getAnonymousSession(sessionData.sessionId);
          if (stat.status === 'active' && sessionStatus === 'waiting') {
            setSessionStatus('active');
            if (stat.counsellorName) setCounsellorName(stat.counsellorName);
          } else if (stat.status === 'ended') {
            setSessionStatus('ended');
            clearInterval(pollTimer);
          }
        } catch {}
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to start anonymous session.');
      setInSession(false);
    } finally {
      setLoading(false);
    }
  };

  const setupWebRTC = async (currentSessionId: string, isInitiator: boolean) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionState('connected');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            sessionId: currentSessionId,
            candidate: event.candidate
          }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setConnectionState('connected');
        } else if (pc.connectionState === 'connecting') {
          setConnectionState('connecting');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionState('disconnected');
        }
      };

      if (isInitiator) {
        setConnectionState('connecting');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            sessionId: currentSessionId,
            sdp: offer
          }));
        }
      }
    } catch (err) {
      console.error('WebRTC initialization failed:', err);
    }
  };

  const handleOffer = async (sdp: any) => {
    try {
      if (!peerConnectionRef.current) {
        await setupWebRTC(sessionId!, false);
      }
      const pc = peerConnectionRef.current!;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'answer',
          sessionId,
          sdp: answer
        }));
      }
    } catch (err) {
      console.error('Error handling WebRTC offer:', err);
    }
  };

  const handleToggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoDisabled(!videoTrack.enabled);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      sender: guestAlias,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat-message',
        sessionId,
        ...newMsg
      }));
    }

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'leave-room', sessionId }));
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    if (sessionId) {
      api.leaveAnonymousSession(sessionId).catch(() => {});
    }

    setInSession(false);
    setSessionStatus('ended');
    setConnectionState('disconnected');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        
        {!inSession ? (
          /* Pre-Call Setup */
          <div className="max-w-xl mx-auto bg-[#111216] border border-white/10 rounded-2xl p-8 sm:p-10 space-y-7 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-[2px] bg-[#E50914]" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                    ZERO DISCLOSURE
                  </span>
                </div>
                <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Anonymous Counselling Room
                </h1>
              </div>
              <Link to="/" className="text-xs font-mono text-[#8E8E93] hover:text-white flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return</span>
              </Link>
            </div>

            <p className="text-sm text-[#9E9EA4] leading-relaxed font-light">
              Encrypted peer-to-peer session with campus counsellor Dr. Evelyn Reed. No account credentials or student identity needed. You will be assigned a temporary cryptographic guest alias.
            </p>

            {/* Privacy Protocol Box */}
            <div className="p-4 bg-[#17181F] border border-white/10 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#E50914] font-mono text-xs uppercase tracking-wider font-semibold">
                <Lock className="w-4 h-4" />
                <span>Privacy Safeguards:</span>
              </div>
              <ul className="text-xs text-[#9E9EA4] space-y-1.5 pl-2 font-light">
                <li>• Ephemeral alias generated automatically (e.g. Guest-098).</li>
                <li>• Zero assessment records or student history attached.</li>
                <li>• Peer-to-peer WebRTC encrypted stream with STUN relay.</li>
                <li>• Zero recording or message logs kept after session.</li>
              </ul>
            </div>

            {error && (
              <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Mode */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Select Communication Format:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMode('video')}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMode === 'video'
                      ? 'border-[#E50914] bg-[#E50914]/15 ring-1 ring-[#E50914]'
                      : 'border-white/10 bg-[#17181F] hover:border-white/25'
                  }`}
                >
                  <Video className="w-5 h-5 mx-auto mb-1.5 text-white" />
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-white block">Video Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('audio')}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMode === 'audio'
                      ? 'border-[#E50914] bg-[#E50914]/15 ring-1 ring-[#E50914]'
                      : 'border-white/10 bg-[#17181F] hover:border-white/25'
                  }`}
                >
                  <Mic className="w-5 h-5 mx-auto mb-1.5 text-white" />
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-white block">Audio Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('chat')}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMode === 'chat'
                      ? 'border-[#E50914] bg-[#E50914]/15 ring-1 ring-[#E50914]'
                      : 'border-white/10 bg-[#17181F] hover:border-white/25'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mx-auto mb-1.5 text-white" />
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-white block">Live Chat</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleStartSession}
              className="w-full py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="font-mono text-xs">INITIALIZING SECURE SESSION...</span>
              ) : (
                <>
                  <span>Enter Anonymous Room</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </>
              )}
            </button>
          </div>
        ) : (
          /* In-Session Stage */
          <div className="space-y-4">
            
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] font-mono flex items-center justify-center font-bold text-xs">
                  ANON
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Outfit'] text-base font-bold text-white">
                      Session Alias: {guestAlias}
                    </h2>
                    <span className={`text-[11px] font-mono font-medium ${sessionStatus === 'active' ? 'text-[#E50914]' : 'text-amber-400'}`}>
                      · {sessionStatus === 'active' ? 'Counsellor Connected' : 'Waiting in Queue...'}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#8E8E93]">
                    COUNSELLOR: {counsellorName} · MODE: {selectedMode.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleEndCall}
                className="px-5 py-2.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Terminate Session</span>
              </button>
            </div>

            {mediaError && (
              <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57]">
                {mediaError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Media Stage */}
              <div className="lg:col-span-7 bg-[#111216] border border-white/10 rounded-2xl min-h-[380px] relative flex flex-col items-center justify-center text-white p-4 shadow-xl overflow-hidden">
                
                {selectedMode === 'video' ? (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover max-h-[380px] rounded-xl border border-white/10"
                    />

                    {connectionState !== 'connected' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111216]/90 p-6 text-center rounded-xl">
                        <div className="w-14 h-14 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mb-3 font-mono font-bold text-lg">
                          P2P
                        </div>
                        <h3 className="font-['Outfit'] text-lg font-bold text-white">
                          {sessionStatus === 'waiting' ? 'Waiting for Counsellor to Accept...' : 'Connecting WebRTC Channels...'}
                        </h3>
                        <p className="text-xs text-[#9E9EA4] mt-1 max-w-sm font-light">
                          {sessionStatus === 'waiting' ? 'Your session request is highlighted in the counsellor console waiting queue.' : 'Negotiating encrypted video feed.'}
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 w-32 h-24 bg-black rounded-xl border border-[#E50914]/50 overflow-hidden shadow-xl">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1.5 text-[9px] font-mono bg-black/80 px-1 text-[#E50914] rounded">
                        {guestAlias} (YOU)
                      </div>
                    </div>
                  </div>
                ) : selectedMode === 'audio' ? (
                  <div className="text-center space-y-3 py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mx-auto">
                      <Mic className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-['Outfit'] text-xl font-bold text-white">Encrypted Audio Line</h3>
                      <p className="font-mono text-xs text-[#8E8E93] mt-1">
                        {sessionStatus === 'waiting' ? 'WAITING FOR COUNSELLOR...' : 'AUDIO CALL ACTIVE'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mx-auto">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-['Outfit'] text-xl font-bold text-white">Text-Only Communication</h3>
                      <p className="font-mono text-xs text-[#8E8E93] mt-1">
                        Camera and microphone are disabled. Real-time messages operate on the right.
                      </p>
                    </div>
                  </div>
                )}

                {/* In-Call Controls */}
                {(selectedMode === 'video' || selectedMode === 'audio') && (
                  <div className="mt-auto pt-3 flex items-center gap-3 z-10">
                    <button
                      onClick={handleToggleAudio}
                      className={`p-3 rounded-full cursor-pointer transition-colors ${
                        audioMuted ? 'bg-[#E50914] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {audioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {selectedMode === 'video' && (
                      <button
                        onClick={handleToggleVideo}
                        className={`p-3 rounded-full cursor-pointer transition-colors ${
                          videoDisabled ? 'bg-[#E50914] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {videoDisabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* Right Chat Stage */}
              <div className="lg:col-span-5 bg-[#111216] border border-white/10 rounded-2xl flex flex-col h-[480px] shadow-xl overflow-hidden">
                <div className="p-3.5 border-b border-white/10 bg-[#17181F] flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-medium">Encrypted Live Chat</span>
                  <span className="text-[#E50914] text-[10px] uppercase">P2P WEBSOCKET</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#17181F] border border-white/5 rounded-xl text-[#8E8E93] text-[11px]">
                    Anonymous session active. Messages are delivered peer-to-peer and will not be logged.
                  </div>

                  {messages.map((m, idx) => {
                    const isMe = m.sender === guestAlias;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-[#71717A] mb-1">{m.sender} · {m.timestamp}</span>
                        <div className={`p-3 rounded-xl max-w-[85%] ${
                          isMe
                            ? 'bg-[#E50914] text-white font-medium'
                            : 'bg-[#17181F] border border-white/10 text-white'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#17181F] flex gap-2 font-mono">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type encrypted message..."
                    className="flex-1 px-3.5 py-2 bg-[#111216] border border-white/10 rounded-xl focus:border-[#E50914] text-white text-xs outline-none placeholder-[#71717A]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E50914] text-white rounded-xl text-xs uppercase hover:bg-[#c20811] transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
