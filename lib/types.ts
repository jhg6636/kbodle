
export type Team = "LG" | "KT" | "SSG" | "NC" | "두산" | "KIA" | "롯데" | "삼성" | "한화" | "키움";
export type PositionGroup = "P" | "C" | "IF" | "OF";
export type Throws = "R" | "L";
export type Bats = "R" | "L" | "S";

export interface Player {
  id: number;
  name: string;
  nameNorm: string;
  team: Team;
  positionGroup: PositionGroup;
  positionDetail: string;
  throws: Throws;
  bats: Bats;
  birthDate: string; // "YYYY-MM-DD"
  nationality: string; // "KR"
  jerseyNumber: number;
}
