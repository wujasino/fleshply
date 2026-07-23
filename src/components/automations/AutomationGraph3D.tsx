import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d';

interface MonitorConfig {
  brand: string | null;
  competitors: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  models: string[];
  alert_metric: string | null;
  alert_threshold: number | null;
  enabled: boolean;
}

type NodeGroup = 'brand' | 'competitor' | 'model' | 'alert';

interface GraphNode {
  id: string;
  label: string;
  group: NodeGroup;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

const GROUP_COLOR: Record<NodeGroup, string> = {
  brand: '#8B79F6',
  competitor: '#D97706',
  model: '#22D3EE',
  alert: '#F87171',
};

const GROUP_NAME: Record<NodeGroup, string> = {
  brand: 'Brand',
  competitor: 'Competitor',
  model: 'AI model',
  alert: 'Alert rule',
};

/* Turns the saved monitor config into a brand-centered node graph — competitors, models and the alert rule all orbit the brand node. */
function buildGraph(config: MonitorConfig | null): { nodes: GraphNode[]; links: GraphLink[] } {
  const brandId = 'brand';
  const nodes: GraphNode[] = [{ id: brandId, label: config?.brand || 'Your brand', group: 'brand', val: 7 }];
  const links: GraphLink[] = [];

  (config?.competitors ?? []).forEach(c => {
    const id = `c:${c}`;
    nodes.push({ id, label: c, group: 'competitor', val: 3 });
    links.push({ source: brandId, target: id });
  });

  const models = config?.models?.length ? config.models : ['GPT-4o', 'Claude', 'Gemini'];
  models.forEach(m => {
    const id = `m:${m}`;
    nodes.push({ id, label: m, group: 'model', val: 4 });
    links.push({ source: brandId, target: id });
  });

  if (config?.alert_metric) {
    nodes.push({
      id: 'alert',
      label: `${config.alert_metric} < ${config.alert_threshold}`,
      group: 'alert',
      val: 3,
    });
    links.push({ source: brandId, target: 'alert' });
  }

  return { nodes, links };
}

export const AutomationGraph3D = ({ config }: { config: MonitorConfig | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => buildGraph(config), [config]);

  useEffect(() => {
    if (!fgRef.current || !size.width) return;
    const controls = fgRef.current.controls() as { autoRotate?: boolean; autoRotateSpeed?: number };
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    fgRef.current.cameraPosition({ z: 260 }, undefined, 0);
  }, [size.width, size.height]);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative h-[420px] rounded-xl border border-border bg-gradient-to-b from-card/50 via-background to-card/30 overflow-hidden"
      >
        {size.width > 0 && (
          <ForceGraph3D
            ref={fgRef}
            width={size.width}
            height={size.height}
            graphData={data}
            backgroundColor="rgba(0,0,0,0)"
            showNavInfo={false}
            enableNodeDrag={false}
            nodeLabel={(n) => (n as unknown as GraphNode).label}
            nodeColor={(n) => GROUP_COLOR[(n as unknown as GraphNode).group]}
            nodeVal={(n) => (n as unknown as GraphNode).val}
            nodeOpacity={0.95}
            nodeResolution={16}
            linkColor={() => 'rgba(139,121,246,0.35)'}
            linkWidth={0.6}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={1.6}
            linkDirectionalParticleSpeed={0.004}
            linkDirectionalParticleColor={() => '#c4b5fd'}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground px-1">
        {(Object.keys(GROUP_COLOR) as NodeGroup[]).map(group => (
          <span key={group} className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GROUP_COLOR[group] }} />
            {GROUP_NAME[group]}
          </span>
        ))}
        <span className="ml-auto italic">Drag to rotate · scroll to zoom</span>
      </div>
    </div>
  );
};

export default AutomationGraph3D;
