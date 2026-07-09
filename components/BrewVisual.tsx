import { StyleSheet, View } from "react-native";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import type { BrewMethod } from "@/data/recipes";
import { n } from "@/utils/scaling";

// Reference points used to brew without a scale.
const AEROPRESS_GRAMS_PER_SCOOP = 11; // level AeroPress scoop of beans
const V60_GRAMS_PER_SCOOP = 12; // level Hario V60 measuring scoop
// Calibrated against a real chamber: 200g of water sits at the ③ mark, so each
// molded number is ~66.7ml and ④ is roughly the brim.
const ML_PER_CHAMBER_NUMBER = 200 / 3;
const CHAMBER_NUMBERS = [1, 2, 3, 4];
const CIRCLED = ["①", "②", "③", "④"];
const FUNNEL_CAPACITY_STEP = 100; // round the drawn capacity up to the next 100ml

// V60 cone geometry: a ~60-degree cone (30-degree half-angle) tapering from a
// wide rim down to the drip hole, drawn with rib lines like a real Hario V60.
const FUNNEL_HEIGHT = n(180);
const FUNNEL_TOP_HALF = n(104); // half the rim width ≈ tan(30) * height
const FUNNEL_RIM_HEIGHT = n(20);
const FUNNEL_SIDE_PAD = n(32); // breathing room each side for the rim/label
const RIB_LENGTH = n(210); // reaches the rim corners from the apex
const RIB_ANGLES = [-30, -20, -10, 0, 10, 20, 30];

function funnelHalfWidth(fraction: number): number {
  return FUNNEL_TOP_HALF * fraction;
}

// Flat-bottom dripper (Orea O1 / Z1) geometry: a truncated cone with a
// wide flat bed, drawn as a trapezoid.
const FLAT_HEIGHT = n(140);
const FLAT_TOP_HALF = n(100);
const FLAT_BASE_HALF = n(58);
const FLAT_INSET = FLAT_TOP_HALF - FLAT_BASE_HALF; // slant per side
const FLAT_GRAMS_PER_SCOOP = 10; // generic level coffee scoop

// Trapezoid anchored at the flat base, filled up to a height fraction.
function flatFillStyle(fraction: number, color: string) {
  return {
    width: FLAT_BASE_HALF * 2,
    height: 0,
    borderBottomWidth: FLAT_HEIGHT * fraction,
    borderBottomColor: color,
    borderLeftWidth: FLAT_INSET * fraction,
    borderLeftColor: "transparent",
    borderRightWidth: FLAT_INSET * fraction,
    borderRightColor: "transparent",
  } as const;
}

// Border-triangle that fills the cone from the drip hole up to a height,
// pointing down so the apex sits at the drip hole.
function funnelFillStyle(fraction: number, color: string) {
  const topHalf = funnelHalfWidth(fraction);
  return {
    width: 0,
    height: 0,
    borderTopWidth: FUNNEL_HEIGHT * fraction,
    borderTopColor: color,
    borderLeftWidth: topHalf,
    borderLeftColor: "transparent",
    borderRightWidth: topHalf,
    borderRightColor: "transparent",
  } as const;
}

const QUARTER_GLYPHS: Record<number, string> = {
  0.25: "¼",
  0.5: "½",
  0.75: "¾",
};

function quarterLabel(value: number): string {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const glyph = QUARTER_GLYPHS[rounded - whole] ?? "";
  if (whole === 0) {
    return glyph || "0";
  }
  return `${whole}${glyph}`;
}

function scoopRow(coffeeGrams: number, gramsPerScoop: number, label: string) {
  const scoops = quarterLabel(coffeeGrams / gramsPerScoop);
  const unit = scoops === "1" ? "scoop" : "scoops";
  return {
    value: `${scoops} ${unit}`,
    hint: `${coffeeGrams}g coffee · ${label}`,
  };
}

interface BrewVisualProps {
  coffeeGrams: number;
  method: BrewMethod;
  waterGrams: number;
}

export function BrewVisual({
  coffeeGrams,
  method,
  waterGrams,
}: BrewVisualProps) {
  const { invertColors } = useInvertColors();
  const fg = invertColors ? "black" : "white";

  if (method === "v60") {
    return (
      <V60Visual coffeeGrams={coffeeGrams} fg={fg} waterGrams={waterGrams} />
    );
  }
  if (method === "orea-o1" || method === "orea-z1") {
    return (
      <FlatBedVisual
        coffeeGrams={coffeeGrams}
        fg={fg}
        label={method === "orea-o1" ? "Orea O1 dripper" : "Orea Z1 dripper"}
        waterGrams={waterGrams}
      />
    );
  }
  return (
    <AeroPressVisual
      coffeeGrams={coffeeGrams}
      fg={fg}
      waterGrams={waterGrams}
    />
  );
}

function FlatBedVisual({
  coffeeGrams,
  fg,
  label,
  waterGrams,
}: {
  coffeeGrams: number;
  fg: string;
  label: string;
  waterGrams: number;
}) {
  const coffee = scoopRow(
    coffeeGrams,
    FLAT_GRAMS_PER_SCOOP,
    "level coffee scoop"
  );
  // Like the V60: capacity rounds up to the next 100ml so the fill line
  // stays below the rim.
  const capacity =
    (Math.floor(waterGrams / FUNNEL_CAPACITY_STEP) + 1) * FUNNEL_CAPACITY_STEP;
  const fillFraction = waterGrams / capacity;
  const fillHalfWidth = FLAT_BASE_HALF + FLAT_INSET * fillFraction;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StyledText style={styles.value}>{coffee.value}</StyledText>
        <StyledText style={styles.hint}>{coffee.hint}</StyledText>
      </View>

      <View style={styles.row}>
        <StyledText
          style={styles.value}
        >{`Fill to ~${waterGrams}ml`}</StyledText>
        <StyledText style={styles.hint}>
          {`${waterGrams}g water · ${label}`}
        </StyledText>
      </View>

      <View style={styles.funnelRow}>
        <View style={styles.flatBed}>
          <View style={styles.flatLayer}>
            <View style={[flatFillStyle(1, fg), styles.funnelBody]} />
          </View>
          <View style={styles.flatLayer}>
            <View
              style={[flatFillStyle(fillFraction, fg), styles.funnelWater]}
            />
          </View>
          <View
            style={[
              styles.funnelTarget,
              { bottom: FLAT_HEIGHT * fillFraction - n(10) },
            ]}
          >
            <View
              style={[
                styles.funnelTargetLine,
                { backgroundColor: fg, width: fillHalfWidth * 2 },
              ]}
            />
            <StyledText style={styles.funnelTargetLabel}>
              {`${waterGrams}ml`}
            </StyledText>
          </View>
        </View>
      </View>
    </View>
  );
}

function AeroPressVisual({
  coffeeGrams,
  fg,
  waterGrams,
}: {
  coffeeGrams: number;
  fg: string;
  waterGrams: number;
}) {
  const chamberCapacity = ML_PER_CHAMBER_NUMBER * CHAMBER_NUMBERS.length;
  const coffee = scoopRow(
    coffeeGrams,
    AEROPRESS_GRAMS_PER_SCOOP,
    "level AeroPress scoop"
  );
  // The chamber is only numbered to ④, so a larger brew can't name a mark.
  // Otherwise name the fill height to the nearest quarter mark so the label
  // matches the drawn water line.
  const overCapacity = waterGrams > chamberCapacity;
  const chamberTarget = overCapacity
    ? "the top"
    : quarterLabel(waterGrams / ML_PER_CHAMBER_NUMBER);
  const fillFraction = Math.min(waterGrams / chamberCapacity, 1);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StyledText style={styles.value}>{coffee.value}</StyledText>
        <StyledText style={styles.hint}>{coffee.hint}</StyledText>
      </View>

      <View style={styles.row}>
        <StyledText
          style={styles.value}
        >{`Fill to ${chamberTarget}`}</StyledText>
        <StyledText style={styles.hint}>
          {`${waterGrams}g water · chamber numbers`}
        </StyledText>
      </View>

      <View style={styles.chamberRow}>
        <View style={[styles.chamber, { borderColor: fg }]}>
          <View
            style={[
              styles.water,
              { height: `${fillFraction * 100}%`, backgroundColor: fg },
            ]}
          />
          {CHAMBER_NUMBERS.map((num, index) => (
            <View
              key={num}
              style={[
                styles.tick,
                { bottom: `${(num / CHAMBER_NUMBERS.length) * 100}%` },
              ]}
            >
              <View style={[styles.tickLine, { backgroundColor: fg }]} />
              <StyledText style={styles.tickLabel}>{CIRCLED[index]}</StyledText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function V60Visual({
  coffeeGrams,
  fg,
  waterGrams,
}: {
  coffeeGrams: number;
  fg: string;
  waterGrams: number;
}) {
  const coffee = scoopRow(
    coffeeGrams,
    V60_GRAMS_PER_SCOOP,
    "level Hario scoop"
  );
  // Capacity rounds up to the next 100ml so the fill line stays below the rim.
  const capacity =
    (Math.floor(waterGrams / FUNNEL_CAPACITY_STEP) + 1) * FUNNEL_CAPACITY_STEP;
  const fillFraction = waterGrams / capacity;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StyledText style={styles.value}>{coffee.value}</StyledText>
        <StyledText style={styles.hint}>{coffee.hint}</StyledText>
      </View>

      <View style={styles.row}>
        <StyledText
          style={styles.value}
        >{`Fill to ~${waterGrams}ml`}</StyledText>
        <StyledText style={styles.hint}>
          {`${waterGrams}g water · Hario V60 dripper`}
        </StyledText>
      </View>

      <View style={styles.funnelRow}>
        <View style={styles.funnel}>
          <View style={[styles.rim, { borderColor: fg }]} />
          <View style={styles.cone}>
            <View style={styles.funnelLayer}>
              <View style={[funnelFillStyle(1, fg), styles.funnelBody]} />
            </View>
            <View style={styles.funnelLayer}>
              <View
                style={[funnelFillStyle(fillFraction, fg), styles.funnelWater]}
              />
            </View>
            {RIB_ANGLES.map((angle) => (
              <View
                key={angle}
                style={[
                  styles.rib,
                  {
                    backgroundColor: fg,
                    opacity: Math.abs(angle) === 30 ? 0.7 : 0.22,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            ))}
          </View>
          <View
            style={[
              styles.funnelTarget,
              { bottom: FUNNEL_HEIGHT * fillFraction - n(10) },
            ]}
          >
            <View
              style={[
                styles.funnelTargetLine,
                {
                  backgroundColor: fg,
                  width: funnelHalfWidth(fillFraction) * 2,
                },
              ]}
            />
            <StyledText style={styles.funnelTargetLabel}>
              {`${waterGrams}ml`}
            </StyledText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: n(18),
  },
  row: {
    gap: n(2),
  },
  value: {
    fontSize: n(26),
  },
  hint: {
    fontSize: n(15),
    opacity: 0.6,
  },
  chamberRow: {
    width: "100%",
    alignItems: "center",
    paddingTop: n(6),
  },
  chamber: {
    width: n(120),
    height: n(220),
    borderWidth: n(2),
    borderTopLeftRadius: n(6),
    borderTopRightRadius: n(6),
    borderBottomLeftRadius: n(20),
    borderBottomRightRadius: n(20),
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  water: {
    width: "100%",
    opacity: 0.25,
  },
  tick: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  tickLine: {
    height: n(1),
    width: n(14),
    opacity: 0.7,
  },
  tickLabel: {
    fontSize: n(15),
    paddingLeft: n(6),
    opacity: 0.7,
  },
  funnelRow: {
    width: "100%",
    alignItems: "center",
    paddingTop: n(10),
  },
  flatBed: {
    width: FLAT_TOP_HALF * 2 + FUNNEL_SIDE_PAD * 2,
    height: FLAT_HEIGHT,
    position: "relative",
  },
  flatLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  funnel: {
    width: FUNNEL_TOP_HALF * 2 + FUNNEL_SIDE_PAD * 2,
    height: FUNNEL_HEIGHT + FUNNEL_RIM_HEIGHT / 2,
    position: "relative",
  },
  rim: {
    position: "absolute",
    top: 0,
    left: FUNNEL_SIDE_PAD,
    width: FUNNEL_TOP_HALF * 2,
    height: FUNNEL_RIM_HEIGHT,
    borderWidth: n(2),
    borderRadius: FUNNEL_TOP_HALF,
    opacity: 0.75,
    zIndex: 2,
  },
  cone: {
    position: "absolute",
    top: FUNNEL_RIM_HEIGHT / 2,
    left: FUNNEL_SIDE_PAD,
    width: FUNNEL_TOP_HALF * 2,
    height: FUNNEL_HEIGHT,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  funnelLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  funnelBody: {
    opacity: 0.1,
  },
  funnelWater: {
    opacity: 0.28,
  },
  rib: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: n(2),
    height: RIB_LENGTH,
    marginLeft: n(-1),
    transformOrigin: "50% 100%",
  },
  funnelTarget: {
    position: "absolute",
    left: 0,
    right: 0,
    height: n(20),
    alignItems: "center",
    justifyContent: "center",
  },
  funnelTargetLine: {
    height: n(2),
  },
  funnelTargetLabel: {
    position: "absolute",
    right: n(4),
    fontSize: n(15),
    opacity: 0.85,
  },
});
