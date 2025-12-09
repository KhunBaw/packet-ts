
/**
 * PacketWriter - Binary packet writer for creating packets
 * Supports Little Endian encoding
 */
export class PacketWriter {
    private buffer: number[] = [];
    private packetId: number;

    constructor(packetId: number) {
        this.packetId = packetId;
        this.writeUInt16(packetId); // Write packet ID first
    }

    /**
     * Write unsigned 8-bit integer (1 byte)
     */
    writeUInt8(value: number): void {
        this.buffer.push(value & 0xFF);
    }

    /**
     * Write unsigned 16-bit integer (2 bytes, Little Endian)
     */
    writeUInt16(value: number): void {
        this.buffer.push(value & 0xFF);
        this.buffer.push((value >> 8) & 0xFF);
    }

    /**
     * Write unsigned 32-bit integer (4 bytes, Little Endian)
     */
    writeUInt32(value: number): void {
        this.buffer.push(value & 0xFF);
        this.buffer.push((value >> 8) & 0xFF);
        this.buffer.push((value >> 16) & 0xFF);
        this.buffer.push((value >> 24) & 0xFF);
    }

    /**
     * Write unsigned 64-bit integer (8 bytes, Little Endian)
     * Note: JavaScript numbers lose precision above 2^53
     * Use BigInt for large numbers
     */
    writeUInt64(value: bigint | number): void {
        const bigValue = typeof value === 'bigint' ? value : BigInt(value);

        for (let i = 0; i < 8; i++) {
            this.buffer.push(Number((bigValue >> BigInt(i * 8)) & BigInt(0xFF)));
        }
    }

    /**
     * Write signed 32-bit integer (4 bytes, Little Endian)
     */
    writeInt32(value: number): void {
        const buffer = new ArrayBuffer(4);
        new DataView(buffer).setInt32(0, value, true); // true = Little Endian
        const bytes = new Uint8Array(buffer);
        this.buffer.push(...bytes);
    }

    /**
     * Write signed 64-bit integer (8 bytes, Little Endian)
     */
    writeInt64(value: bigint | number): void {
        const bigValue = typeof value === 'bigint' ? value : BigInt(value);
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setBigInt64(0, bigValue, true);
        const bytes = new Uint8Array(buffer);
        this.buffer.push(...bytes);
    }

    /**
     * Write 32-bit float (4 bytes, Little Endian)
     */
    writeFloat32(value: number): void {
        const buffer = new ArrayBuffer(4);
        new DataView(buffer).setFloat32(0, value, true);
        const bytes = new Uint8Array(buffer);
        this.buffer.push(...bytes);
    }

    /**
     * Write 64-bit float (8 bytes, Little Endian)
     */
    writeFloat64(value: number): void {
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, value, true);
        const bytes = new Uint8Array(buffer);
        this.buffer.push(...bytes);
    }

    /**
     * Write boolean (1 byte: 0x00 or 0x01)
     */
    writeBool(value: boolean): void {
        this.buffer.push(value ? 0x01 : 0x00);
    }

    /**
     * Write string (2 bytes length + UTF-8 bytes)
     */
    writeString(value: string): void {
        const utf8Bytes = new TextEncoder().encode(value);
        this.writeUInt16(utf8Bytes.length);
        this.buffer.push(...utf8Bytes);
    }

    /**
     * Write raw bytes (no length prefix)
     */
    writeBytes(bytes: Uint8Array): void {
        this.buffer.push(...bytes);
    }

    /**
     * Get packet data WITH header
     */
    getBytes(): Uint8Array {
        const payloadLength = this.buffer.length;
        const fullPacket = new Uint8Array(2 + payloadLength);

        // Write header (packet size, excluding header itself)
        fullPacket[0] = payloadLength & 0xFF;
        fullPacket[1] = (payloadLength >> 8) & 0xFF;

        // Write payload (PacketID + data)
        fullPacket.set(this.buffer, 2);

        return fullPacket;
    }

    /**
     * Get packet data WITHOUT header (just PacketID + payload)
     */
    getData(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    /**
     * Get packet ID
     */
    getPacketId(): number {
        return this.packetId;
    }
}
