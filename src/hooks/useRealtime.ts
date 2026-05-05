import { useEffect, useState, useRef } from "react";
import { api, type Snapshot } from "@/lib/api";

export function useRealtime(project = "farm", intervalMs = 3000) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sysHistory = useRef<{ cpu: number[]; mem: number[]; net: number[] }>({ cpu: [], mem: [], net: [] });

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const data = await api.snapshot(project);
        if (!alive) return;
        sysHistory.current.cpu = [...sysHistory.current.cpu, data.system.cpu].slice(-30);
        sysHistory.current.mem = [...sysHistory.current.mem, data.system.memory].slice(-30);
        sysHistory.current.net = [...sysHistory.current.net, data.system.network].slice(-30);
        setSnap(data);
        setError(null);
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) timer = setTimeout(tick, intervalMs);
      }
    };
    tick();

    return () => { alive = false; clearTimeout(timer); };
  }, [project, intervalMs]);

  return { snap, error, sysHistory: sysHistory.current };
}
