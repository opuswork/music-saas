import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Must match schema.prisma enum AssetType */
export const AssetTypeEnum = ['VIDEO', 'PDF', 'MIDI', 'MUSICXML', 'AUDIO'] as const;
export type AssetType = (typeof AssetTypeEnum)[number];

/** JSON type compatible with Prisma Json fields (e.g. LessonAsset.metadata). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export class CreateLessonAssetDto {
  @ApiProperty()
  lessonId: string;

  @ApiProperty({ enum: AssetTypeEnum, description: 'Asset type' })
  type: AssetType;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  metadata?: JsonValue;
}
