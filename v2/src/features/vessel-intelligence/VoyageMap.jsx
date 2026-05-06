import React from 'react';

/**
 * VoyageMap — schematic SVG render of vessel track.
 *
 * Renders observed (solid) and predicted (dashed) tracks with origin and
 * destination labels. This is a placeholder for the production Google Maps
 * integration, but uses the same coordinate inputs so the swap is mechanical.
 *
 * @param {{
 *   observed: Array<[lat, lon]>,
 *   predicted: Array<[lat, lon]>,
 *   origin: { name: string, time?: string },
 *   destination: { name: string, time?: string, isLive?: boolean }
 * }} props
 */
export default function VoyageMap({ observed = [], predicted = [], origin, destination }) {
  // Map coordinates into the SVG viewBox by computing bounding box and padding.
  const all = [...observed, ...predicted];
  if (all.length === 0) return null;

  const lats = all.map((p) => p[0]);
  const lons = all.map((p) => p[1]);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLon = Math.min(...lons),
    maxLon = Math.max(...lons);

  const W = 640,
    H = 240,
    pad = 60;
  const project = ([lat, lon]) => {
    const x = pad + ((lon - minLon) / Math.max(0.001, maxLon - minLon)) * (W - 2 * pad);
    // Latitude inverted — higher lat = lower y
    const y = pad + ((maxLat - lat) / Math.max(0.001, maxLat - minLat)) * (H - 2 * pad);
    return [x, y];
  };

  const obsPath = observed
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p).join(',')}`)
    .join(' ');
  const predPath = predicted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p).join(',')}`)
    .join(' ');

  const originXY = observed.length ? project(observed[0]) : null;
  const lastObsXY = observed.length ? project(observed[observed.length - 1]) : null;
  const destXY = predicted.length ? project(predicted[predicted.length - 1]) : null;

  return (
    <div
      style={{
        position: 'relative',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        marginBottom: 18,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        style={{ display: 'block', background: 'var(--color-background-secondary)' }}
      >
        {/* Land masses (decorative) */}
        <path
          d={`M 0,40 L 70,55 L 110,40 L 145,80 L 180,90 L 165,130 L 130,160 L 90,180 L 60,210 L 0,225 Z`}
          fill="var(--color-background-tertiary)"
          opacity="0.7"
        />
        <path
          d={`M ${W - 200},10 L ${W - 100},5 L ${W},20 L ${W},0 Z`}
          fill="var(--color-background-tertiary)"
          opacity="0.7"
        />

        {obsPath && (
          <path d={obsPath} fill="none" stroke="var(--color-text-info)" strokeWidth="1.6" opacity="0.85" />
        )}
        {predPath && (
          <path
            d={predPath}
            fill="none"
            stroke="var(--color-text-info)"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.55"
          />
        )}

        {/* AIS sample points */}
        {observed.slice(1, -1).map((p, i) => {
          const [x, y] = project(p);
          return <circle key={i} cx={x} cy={y} r="2.2" fill="var(--color-text-info)" opacity="0.8" />;
        })}

        {/* Origin marker */}
        {originXY && (
          <>
            <circle
              cx={originXY[0]}
              cy={originXY[1]}
              r="5"
              fill="var(--color-background-primary)"
              stroke="var(--color-text-info)"
              strokeWidth="2"
            />
            {origin?.name && (
              <text
                x={originXY[0]}
                y={originXY[1] - 12}
                fontSize="11"
                fill="var(--color-text-primary)"
                fontFamily="var(--font-sans)"
                textAnchor="start"
                fontWeight="500"
              >
                {origin.name}
              </text>
            )}
          </>
        )}

        {/* Current position (last observed) */}
        {lastObsXY && observed.length > 1 && destination?.isLive && (
          <>
            <circle
              cx={lastObsXY[0]}
              cy={lastObsXY[1]}
              r="6"
              fill="var(--color-background-primary)"
              stroke="var(--color-text-info)"
              strokeWidth="2"
            />
            <circle
              cx={lastObsXY[0]}
              cy={lastObsXY[1]}
              r="11"
              fill="none"
              stroke="var(--color-text-info)"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <text
              x={lastObsXY[0]}
              y={lastObsXY[1] + 22}
              fontSize="11"
              fill="var(--color-text-primary)"
              fontFamily="var(--font-sans)"
              textAnchor="middle"
              fontWeight="500"
            >
              Now
            </text>
          </>
        )}

        {/* Destination marker */}
        {destXY && destination && (
          <>
            <circle cx={destXY[0]} cy={destXY[1]} r="5" fill="var(--color-text-info)" />
            <text
              x={destXY[0]}
              y={destXY[1] - 10}
              fontSize="11"
              fill="var(--color-text-primary)"
              fontFamily="var(--font-sans)"
              textAnchor="middle"
              fontWeight="500"
            >
              {destination.name}
            </text>
            {destination.time && (
              <text
                x={destXY[0]}
                y={destXY[1] + 18}
                fontSize="10"
                fill="var(--color-text-secondary)"
                fontFamily="var(--font-sans)"
                textAnchor="middle"
              >
                {destination.time}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
