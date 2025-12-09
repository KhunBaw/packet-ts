/**
 * PacketReader - Binary packet reader for parsing packets
 * Supports Little Endian encoding
 */
export class PacketReader {
    private data: Uint8Array;
    private offset: number = 0;

    constructor(data: Uint8Array | ArrayBuffer) {
        this.data = data instanceof Uint8Array ? data : new Uint8Array(data);
    }

    /**
     * Read unsigned 8-bit integer (1 byte)
     */
    readUInt8(): number {
        if (this.offset + 1 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read UInt8');
        }
        return this.data[this.offset++];
    }

    /**
     * Read unsigned 16-bit integer (2 bytes, Little Endian)
     */
    readUInt16(): number {
        if (this.offset + 2 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read UInt16');
        }
        const value = this.data[this.offset] | (this.data[this.offset + 1] << 8);
        this.offset += 2;
        return value;
    }

    /**
     * Read unsigned 32-bit integer (4 bytes, Little Endian)
     */
    readUInt32(): number {
        if (this.offset + 4 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read UInt32');
        }
        const value =
            this.data[this.offset] |
            (this.data[this.offset + 1] << 8) |
            (this.data[this.offset + 2] << 16) |
            (this.data[this.offset + 3] << 24);
        this.offset += 4;
        return value >>> 0; // Convert to unsigned
    }

    /**
     * Read unsigned 64-bit integer (8 bytes, Little Endian)
     * Returns BigInt to avoid precision loss
     */
    readUInt64(): bigint {
        if (this.offset + 8 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read UInt64');
        }

        let value = BigInt(0);
        for (let i = 0; i < 8; i++) {
            value |= BigInt(this.data[this.offset + i]) << BigInt(i * 8);
        }
        this.offset += 8;
        return value;
    }

    /**
     * Read signed 32-bit integer (4 bytes, Little Endian)
     */
    readInt32(): number {
        if (this.offset + 4 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read Int32');
        }
        const view = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 4);
        const value = view.getInt32(0, true); // true = Little Endian
        this.offset += 4;
        return value;
    }

    /**
     * Read signed 64-bit integer (8 bytes, Little Endian)
     */
    readInt64(): bigint {
        if (this.offset + 8 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read Int64');
        }
        const view = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 8);
        const value = view.getBigInt64(0, true);
        this.offset += 8;
        return value;
    }

    /**
     * Read 32-bit float (4 bytes, Little Endian)
     */
    readFloat32(): number {
        if (this.offset + 4 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read Float32');
        }
        const view = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 4);
        const value = view.getFloat32(0, true);
        this.offset += 4;
        return value;
    }

    /**
     * Read 64-bit float (8 bytes, Little Endian)
     */
    readFloat64(): number {
        if (this.offset + 8 > this.data.length) {
            throw new Error('PacketReader: Not enough data to read Float64');
        }
        const view = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 8);
        const value = view.getFloat64(0, true);
        this.offset += 8;
        return value;
    }

    /**
     * Read boolean (1 byte)
     */
    readBool(): boolean {
        return this.readUInt8() !== 0;
    }

    /**
     * Read string (2 bytes length + UTF-8 bytes)
     */
    readString(): string {
        const length = this.readUInt16();
        if (this.offset + length > this.data.length) {
            throw new Error('PacketReader: Not enough data to read string');
        }

        const bytes = this.data.slice(this.offset, this.offset + length);
        this.offset += length;

        return new TextDecoder('utf-8').decode(bytes);
    }

    /**
     * Read raw bytes
     */
    readBytes(length: number): Uint8Array {
        if (this.offset + length > this.data.length) {
            throw new Error('PacketReader: Not enough data to read bytes');
        }
        const bytes = this.data.slice(this.offset, this.offset + length);
        this.offset += length;
        return bytes;
    }

    /**
     * Check if all data has been read
     */
    isComplete(): boolean {
        return this.offset === this.data.length;
    }

    /**
     * Get remaining bytes count
     */
    remaining(): number {
        return this.data.length - this.offset;
    }

    /**
     * Reset reader to beginning
     */
    reset(): void {
        this.offset = 0;
    }

    /**
     * Get current offset
     */
    getOffset(): number {
        return this.offset;
    }

    /**
     * Set offset to specific position
     */
    setOffset(offset: number): void {
        if (offset < 0 || offset > this.data.length) {
            throw new Error('PacketReader: Invalid offset');
        }
        this.offset = offset;
    }
}
