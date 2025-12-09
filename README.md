# Packet-TS

TypeScript library สำหรับสร้างและอ่าน binary packets สำหรับการสื่อสารระหว่าง client-server

## Features

- ✅ Binary packet encoding/decoding with Little Endian
- ✅ Support for all basic data types (uint8, uint16, uint32, uint64, int32, int64, float32, float64, bool, string)
- ✅ Type-safe with TypeScript
- ✅ Zero dependencies
- ✅ Lightweight and fast

## Installation

### From npm (when published)
```bash
npm install packet-ts
```

### From GitHub (Current)
```bash
# Install directly from GitHub repository
npm install git+https://github.com/KhunBaw/packet-ts.git

# Or install specific branch
npm install git+https://github.com/KhunBaw/packet-ts.git#main

# Or install specific commit/tag
npm install git+https://github.com/KhunBaw/packet-ts.git#v1.0.0
```

### Using package.json
Add to your `package.json` dependencies:
```json
{
  "dependencies": {
    "packet-ts": "git+https://github.com/KhunBaw/packet-ts.git"
  }
}
```

Then run:
```bash
npm install
```

### Local Development
Clone and link locally for development:
```bash
# Clone repository
git clone https://github.com/KhunBaw/packet-ts.git
cd packet-ts

# Install dependencies and build
npm install
npm run build

# Link globally
npm link

# In your project directory
npm link packet-ts
```

## Quick Start

### Creating a Packet (PacketWriter)

```typescript
import { PacketWriter } from 'packet-ts';

// Create login packet (CSLogin = 10001)
const writer = new PacketWriter(10001);
writer.writeString('username');
writer.writeString('password');
writer.writeUInt8(3); // OSType: Web

// Get packet bytes with header
const packetData = writer.getBytes();

// Send via WebSocket
websocket.send(packetData);
```

### Reading a Packet (PacketReader)

```typescript
import { PacketReader } from 'packet-ts';

// Receive packet from WebSocket
websocket.onmessage = (event) => {
  const data = new Uint8Array(event.data);
  
  // Skip header (2 bytes) and create reader from payload
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  // Read packet ID
  const packetId = reader.readUInt16();
  
  // Read data (must match write order)
  const userId = reader.readUInt64();
  const username = reader.readString();
  const chips = reader.readInt64();
  
  // Validate complete read
  if (!reader.isComplete()) {
    console.warn('Packet not fully read');
  }
};
```

## API Reference

### PacketWriter

#### Constructor
```typescript
new PacketWriter(packetId: number)
```

#### Write Methods
```typescript
writeUInt8(value: number): void          // 1 byte
writeUInt16(value: number): void         // 2 bytes
writeUInt32(value: number): void         // 4 bytes
writeUInt64(value: bigint | number): void // 8 bytes
writeInt32(value: number): void          // 4 bytes
writeInt64(value: bigint | number): void  // 8 bytes
writeFloat32(value: number): void        // 4 bytes
writeFloat64(value: number): void        // 8 bytes
writeBool(value: boolean): void          // 1 byte
writeString(value: string): void         // 2 bytes (length) + UTF-8 bytes
writeBytes(bytes: Uint8Array): void      // N bytes
```

#### Get Data
```typescript
getBytes(): Uint8Array       // Get packet WITH header
getData(): Uint8Array        // Get packet WITHOUT header
getPacketId(): number        // Get packet ID
```

### PacketReader

#### Constructor
```typescript
new PacketReader(data: Uint8Array | ArrayBuffer)
```

#### Read Methods
```typescript
readUInt8(): number
readUInt16(): number
readUInt32(): number
readUInt64(): bigint
readInt32(): number
readInt64(): bigint
readFloat32(): number
readFloat64(): number
readBool(): boolean
readString(): string
readBytes(length: number): Uint8Array
```

#### Utility Methods
```typescript
isComplete(): boolean        // Check if all data read
remaining(): number          // Get remaining bytes
reset(): void               // Reset to beginning
getOffset(): number         // Get current position
setOffset(offset: number): void // Set position
```

### Packet IDs

#### Client → Server Packet IDs (10000-19999)
```typescript
const CSLogin = 10001;
const CSChat = 10002;
const CSDummyJoin = 10003;
const CSDummySit = 10004;
const CSDummyReady = 10005;
const CSDummyDraw = 10006;
const CSDummyDiscard = 10007;
const CSDummyLeave = 10009;
const CSLogout = 10010;
const CSHeartbeat = 10011;
```

#### Server → Client Packet IDs (20000-29999)
```typescript
const SCError = 20000;
const SCLoggedIn = 20001;
const SCChat = 20002;
const SCDummyJoin = 20003;
const SCDummySit = 20004;
const SCDummyReady = 20005;
const SCDummyDraw = 20006;
const SCDummyDiscard = 20007;
const SCDummyEndRound = 20008;
const SCDummyStartRound = 20009;
const SCDummyAllScore = 20050;
const SCHeartbeat = 20011;
```

## Binary Format

```
┌──────────────┬──────────────┬────────────────────┐
│  Header (2)  │ PacketID (2) │    Payload (N)     │
└──────────────┴──────────────┴────────────────────┘
```

- **Header**: 2 bytes - Packet size (Little Endian, excluding header)
- **PacketID**: 2 bytes - Packet identifier (Little Endian)
- **Payload**: N bytes - Actual data

## Example: Complete Usage

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Packet IDs
const CSLogin = 10001;
const SCLoggedIn = 20001;
const SCError = 20000;

// Create and send login packet
const writer = new PacketWriter(CSLogin);
writer.writeString('player123');
writer.writeString('secret');
writer.writeUInt8(3); // Web platform

const loginData = writer.getBytes();
websocket.send(loginData);

// Handle login response
function handleLoginResponse(data: Uint8Array) {
  const payload = data.slice(2); // Skip header
  const reader = new PacketReader(payload);
  
  const packetId = reader.readUInt16();
  
  if (packetId === SCLoggedIn) {
    const userId = reader.readUInt64();
    const username = reader.readString();
    const chips = reader.readInt64();
    
    console.log(`Logged in as ${username} with ${chips} chips`);
  } else if (packetId === SCError) {
    const errorMsg = reader.readString();
    console.error(`Login failed: ${errorMsg}`);
  }
}
```

## Data Type Sizes

| Type | Size | Range |
|------|------|-------|
| uint8 | 1 byte | 0 to 255 |
| uint16 | 2 bytes | 0 to 65,535 |
| uint32 | 4 bytes | 0 to 4,294,967,295 |
| uint64 | 8 bytes | 0 to 2^64-1 (BigInt) |
| int32 | 4 bytes | -2^31 to 2^31-1 |
| int64 | 8 bytes | -2^63 to 2^63-1 (BigInt) |
| float32 | 4 bytes | IEEE 754 single |
| float64 | 8 bytes | IEEE 754 double |
| bool | 1 byte | true (0x01) or false (0x00) |
| string | 2+N bytes | uint16 length + UTF-8 |

## Advanced Usage

### 1. Creating Complex Packets

```typescript
import { PacketWriter } from 'packet-ts';

// Example: Send player movement with multiple data types
const CSPlayerMove = 10100; // Define your packet ID
const writer = new PacketWriter(CSPlayerMove);
writer.writeUInt64(12345n);        // Player ID (BigInt)
writer.writeFloat32(100.5);        // X position
writer.writeFloat32(200.3);        // Y position
writer.writeFloat32(45.0);         // Rotation angle
writer.writeBool(true);            // Is running
writer.writeUInt8(3);              // Direction (0-7)

const packet = writer.getBytes();
websocket.send(packet);
```

### 2. Reading Complex Packets

```typescript
import { PacketReader } from 'packet-ts';

function handlePlayerMove(data: Uint8Array) {
  const payload = data.slice(2); // Skip header
  const reader = new PacketReader(payload);
  
  const packetId = reader.readUInt16();
  const playerId = reader.readUInt64();
  const x = reader.readFloat32();
  const y = reader.readFloat32();
  const rotation = reader.readFloat32();
  const isRunning = reader.readBool();
  const direction = reader.readUInt8();
  
  // Validate all data was read
  if (!reader.isComplete()) {
    throw new Error('Incomplete packet data');
  }
  
  console.log(`Player ${playerId} moved to (${x}, ${y})`);
}
```

### 3. Handling Arrays/Lists

```typescript
import { PacketWriter } from 'packet-ts';

// Write array of items
const CSInventoryUpdate = 10200; // Define your packet ID
const writer = new PacketWriter(CSInventoryUpdate);

const items = [
  { id: 1, quantity: 10 },
  { id: 2, quantity: 5 },
  { id: 3, quantity: 1 }
];

// Write array length first
writer.writeUInt8(items.length);

// Write each item
for (const item of items) {
  writer.writeUInt16(item.id);
  writer.writeUInt32(item.quantity);
}

websocket.send(writer.getBytes());
```

```typescript
import { PacketReader } from 'packet-ts';

// Read array of items
function handleInventoryUpdate(data: Uint8Array) {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  reader.readUInt16(); // Skip packet ID
  
  const itemCount = reader.readUInt8();
  const items = [];
  
  for (let i = 0; i < itemCount; i++) {
    items.push({
      id: reader.readUInt16(),
      quantity: reader.readUInt32()
    });
  }
  
  console.log(`Received ${items.length} items:`, items);
}
```

### 4. Working with Strings

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Write multiple strings
const CSChat = 10002;
const writer = new PacketWriter(CSChat);
writer.writeString('PlayerName');
writer.writeString('Hello, World! สวัสดี 🎮'); // Supports UTF-8 and emoji
writer.writeUInt32(Date.now()); // Timestamp

// Read strings
const reader = new PacketReader(payload);
reader.readUInt16(); // Packet ID
const playerName = reader.readString();
const message = reader.readString();
const timestamp = reader.readUInt32();
```

### 5. Error Handling

```typescript
import { PacketReader } from 'packet-ts';

function safeReadPacket(data: Uint8Array) {
  try {
    const payload = data.slice(2);
    const reader = new PacketReader(payload);
    
    const packetId = reader.readUInt16();
    const value = reader.readString();
    
    // Check if all data was consumed
    if (!reader.isComplete()) {
      console.warn(`Unread data: ${reader.remaining()} bytes remaining`);
    }
    
    return { packetId, value };
  } catch (error) {
    console.error('Failed to read packet:', error);
    return null;
  }
}
```

### 6. Packet Size Validation

```typescript
import { PacketWriter } from 'packet-ts';

const CSLogin = 10001;
const writer = new PacketWriter(CSLogin);
writer.writeString('username');
writer.writeString('password');

const packet = writer.getBytes();

// Check packet size
console.log(`Packet size: ${packet.length} bytes`);
console.log(`Payload size: ${packet.length - 2} bytes`); // Excluding header

// Maximum packet size check
const MAX_PACKET_SIZE = 65535; // 2^16 - 1
if (packet.length > MAX_PACKET_SIZE) {
  console.error('Packet too large!');
}
```

### 7. Reusing PacketReader

```typescript
import { PacketReader } from 'packet-ts';

const reader = new PacketReader(payload);

// Read some data
const packetId = reader.readUInt16();
const value1 = reader.readUInt32();

// Reset to read again
reader.reset();

// Read from beginning again
const packetIdAgain = reader.readUInt16();

// Or jump to specific position
reader.setOffset(10); // Skip to byte 10
const value = reader.readUInt8();
```

## Complete Examples

### Example 1: Login Flow

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Packet IDs
const CSLogin = 10001;
const SCLoggedIn = 20001;
const SCError = 20000;

// Client: Send login request
function sendLogin(ws: WebSocket, username: string, password: string) {
  const writer = new PacketWriter(CSLogin);
  writer.writeString(username);
  writer.writeString(password);
  writer.writeUInt8(3); // OSType.Web
  
  ws.send(writer.getBytes());
  console.log('📤 Login request sent');
}

// Client: Handle login response
function handleLoginResponse(data: Uint8Array) {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  const packetId = reader.readUInt16();
  
  if (packetId === SCLoggedIn) {
    const userId = reader.readUInt64();
    const username = reader.readString();
    const chips = reader.readInt64();
    
    console.log('✅ Login successful!');
    console.log(`   User ID: ${userId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Chips: ${chips}`);
    
    return { success: true, userId, username, chips };
  } else if (packetId === SCError) {
    const errorMsg = reader.readString();
    console.error('❌ Login failed:', errorMsg);
    
    return { success: false, error: errorMsg };
  }
}

// Usage
const ws = new WebSocket('ws://localhost:8080/ws');
ws.binaryType = 'arraybuffer';

ws.onopen = () => {
  sendLogin(ws, 'player123', 'mypassword');
};

ws.onmessage = (event) => {
  const data = new Uint8Array(event.data);
  handleLoginResponse(data);
};
```

### Example 2: Game Room System

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Packet IDs
const CSDummyJoin = 10003;
const CSDummySit = 10004;
const CSDummyReady = 10005;

// Join room
function joinRoom(ws: WebSocket, roomId: string) {
  const writer = new PacketWriter(CSDummyJoin);
  writer.writeString(roomId);
  ws.send(writer.getBytes());
}

// Handle room joined
function handleRoomJoined(data: Uint8Array) {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  reader.readUInt16(); // Packet ID
  
  const roomId = reader.readString();
  const playerCount = reader.readUInt8();
  const maxPlayers = reader.readUInt8();
  
  console.log(`🎮 Joined room: ${roomId}`);
  console.log(`   Players: ${playerCount}/${maxPlayers}`);
  
  // Read player list
  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: reader.readUInt64(),
      name: reader.readString(),
      level: reader.readUInt8(),
      isReady: reader.readBool()
    });
  }
  
  console.log('   Player list:', players);
}

// Sit at position
function sitAtPosition(ws: WebSocket, position: number) {
  const writer = new PacketWriter(CSDummySit);
  writer.writeUInt8(position); // 0-3
  ws.send(writer.getBytes());
}

// Mark ready
function setReady(ws: WebSocket, ready: boolean) {
  const writer = new PacketWriter(CSDummyReady);
  writer.writeBool(ready);
  ws.send(writer.getBytes());
}
```

### Example 3: Chat System

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Packet IDs
const CSChat = 10002;

// Send chat message
function sendChatMessage(ws: WebSocket, message: string) {
  const writer = new PacketWriter(CSChat);
  writer.writeString(message);
  writer.writeUInt32(Date.now()); // Timestamp
  
  ws.send(writer.getBytes());
}

// Handle incoming chat
function handleChatMessage(data: Uint8Array) {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  reader.readUInt16(); // Packet ID
  
  const senderId = reader.readUInt64();
  const senderName = reader.readString();
  const message = reader.readString();
  const timestamp = reader.readUInt32();
  
  const date = new Date(timestamp);
  console.log(`💬 [${date.toLocaleTimeString()}] ${senderName}: ${message}`);
  
  return { senderId, senderName, message, timestamp };
}
```

### Example 4: Game State Updates

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Handle game round start
function handleRoundStart(data: Uint8Array) {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  reader.readUInt16(); // Packet ID
  
  const roundNumber = reader.readUInt32();
  const timeLimit = reader.readUInt16(); // seconds
  const headCardId = reader.readUInt8();
  const deckCardsLeft = reader.readUInt8();
  
  // Read player cards
  const cardCount = reader.readUInt8();
  const myCards = [];
  for (let i = 0; i < cardCount; i++) {
    myCards.push(reader.readUInt8());
  }
  
  console.log(`🎴 Round ${roundNumber} started!`);
  console.log(`   Time limit: ${timeLimit}s`);
  console.log(`   Head card: ${headCardId}`);
  console.log(`   Deck cards: ${deckCardsLeft}`);
  console.log(`   My cards: [${myCards.join(', ')}]`);
  
  return { roundNumber, timeLimit, headCardId, deckCardsLeft, myCards };
}

// Handle game round end
function handleRoundEnd(data: Uint8Array) {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  reader.readUInt16(); // Packet ID
  
  const winnerId = reader.readUInt64();
  const winnerName = reader.readString();
  const winAmount = reader.readInt64();
  
  // Read all player scores
  const playerCount = reader.readUInt8();
  const scores = [];
  
  for (let i = 0; i < playerCount; i++) {
    scores.push({
      playerId: reader.readUInt64(),
      playerName: reader.readString(),
      score: reader.readInt32(),
      totalChips: reader.readInt64()
    });
  }
  
  console.log(`🏆 Round ended!`);
  console.log(`   Winner: ${winnerName} (+${winAmount} chips)`);
  console.log(`   Final scores:`, scores);
  
  return { winnerId, winnerName, winAmount, scores };
}
```

### Example 5: Heartbeat System

```typescript
import { PacketWriter } from 'packet-ts';

// Packet IDs
const CSHeartbeat = 10011;

class HeartbeatManager {
  private ws: WebSocket;
  private interval: NodeJS.Timeout | null = null;
  private lastPong: number = Date.now();
  
  constructor(ws: WebSocket) {
    this.ws = ws;
  }
  
  start(intervalMs: number = 30000) {
    this.interval = setInterval(() => {
      this.sendHeartbeat();
      
      // Check if server is responsive
      if (Date.now() - this.lastPong > intervalMs * 2) {
        console.error('⚠️ Server not responding to heartbeat');
        this.ws.close();
      }
    }, intervalMs);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  private sendHeartbeat() {
    const writer = new PacketWriter(CSHeartbeat);
    writer.writeUInt32(Date.now());
    this.ws.send(writer.getBytes());
    console.log('💓 Heartbeat sent');
  }
  
  handleHeartbeatResponse() {
    this.lastPong = Date.now();
    console.log('💓 Heartbeat received');
  }
}

// Usage
const ws = new WebSocket('ws://localhost:8080/ws');
const heartbeat = new HeartbeatManager(ws);

ws.onopen = () => {
  heartbeat.start(30000); // Every 30 seconds
};

ws.onclose = () => {
  heartbeat.stop();
};
```

### Example 6: Packet Router

```typescript
import { PacketReader } from 'packet-ts';

// Packet IDs
const SCLoggedIn = 20001;
const SCChat = 20002;
const SCError = 20000;

type PacketHandler = (reader: PacketReader) => void;

class PacketRouter {
  private handlers = new Map<number, PacketHandler>();
  
  on(packetId: number, handler: PacketHandler) {
    this.handlers.set(packetId, handler);
  }
  
  off(packetId: number) {
    this.handlers.delete(packetId);
  }
  
  handle(data: Uint8Array) {
    try {
      const payload = data.slice(2); // Skip header
      const reader = new PacketReader(payload);
      const packetId = reader.readUInt16();
      
      const handler = this.handlers.get(packetId);
      
      if (handler) {
        handler(reader);
        
        // Validate complete read
        if (!reader.isComplete()) {
          console.warn(
            `⚠️ Packet ${packetId} not fully read. ` +
            `Remaining: ${reader.remaining()} bytes`
          );
        }
      } else {
        console.warn(`⚠️ No handler for packet: ${packetId}`);
      }
    } catch (error) {
      console.error('❌ Error handling packet:', error);
    }
  }
}

// Usage
const router = new PacketRouter();

router.on(SCLoggedIn, (reader) => {
  const userId = reader.readUInt64();
  const username = reader.readString();
  console.log(`Logged in as ${username}`);
});

router.on(SCChat, (reader) => {
  const userId = reader.readUInt64();
  const username = reader.readString();
  const message = reader.readString();
  console.log(`${username}: ${message}`);
});

router.on(SCError, (reader) => {
  const errorMsg = reader.readString();
  console.error(`Server error: ${errorMsg}`);
});

// Handle incoming messages
ws.onmessage = (event) => {
  const data = new Uint8Array(event.data);
  router.handle(data);
};
```

## TypeScript Types

### Creating Custom Packet Types

```typescript
import { PacketWriter, PacketReader } from 'packet-ts';

// Define your data structures
interface Player {
  id: bigint;
  name: string;
  level: number;
  chips: bigint;
  isOnline: boolean;
}

interface GameRoom {
  roomId: string;
  players: Player[];
  maxPlayers: number;
  gameMode: number;
}

// Write helper functions
function writePlayer(writer: PacketWriter, player: Player) {
  writer.writeUInt64(player.id);
  writer.writeString(player.name);
  writer.writeUInt8(player.level);
  writer.writeInt64(player.chips);
  writer.writeBool(player.isOnline);
}

function readPlayer(reader: PacketReader): Player {
  return {
    id: reader.readUInt64(),
    name: reader.readString(),
    level: reader.readUInt8(),
    chips: reader.readInt64(),
    isOnline: reader.readBool()
  };
}

// Use in packets
function createRoomPacket(room: GameRoom): Uint8Array {
  const writer = new PacketWriter(20100);
  
  writer.writeString(room.roomId);
  writer.writeUInt8(room.maxPlayers);
  writer.writeUInt8(room.gameMode);
  writer.writeUInt8(room.players.length);
  
  for (const player of room.players) {
    writePlayer(writer, player);
  }
  
  return writer.getBytes();
}

function parseRoomPacket(data: Uint8Array): GameRoom {
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  
  reader.readUInt16(); // Packet ID
  
  const roomId = reader.readString();
  const maxPlayers = reader.readUInt8();
  const gameMode = reader.readUInt8();
  const playerCount = reader.readUInt8();
  
  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push(readPlayer(reader));
  }
  
  return { roomId, players, maxPlayers, gameMode };
}
```

## Debugging Tips

### 1. Hex Dump Packets

```typescript
function hexDump(data: Uint8Array): string {
  const hex = Array.from(data)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
  return hex;
}

// Debug packet
const CSLogin = 10001;
const writer = new PacketWriter(CSLogin);
writer.writeString('test');
const packet = writer.getBytes();

console.log('Packet hex:', hexDump(packet));
// Output: 0C 00 11 27 04 00 74 65 73 74
```

### 2. Packet Inspector

```typescript
import { PacketReader } from 'packet-ts';

function inspectPacket(data: Uint8Array) {
  console.log('=== Packet Inspection ===');
  console.log('Total size:', data.length, 'bytes');
  console.log('Hex:', hexDump(data));
  
  if (data.length < 4) {
    console.log('⚠️ Packet too small');
    return;
  }
  
  const header = data[0] | (data[1] << 8);
  console.log('Header (payload size):', header, 'bytes');
  
  const payload = data.slice(2);
  const reader = new PacketReader(payload);
  const packetId = reader.readUInt16();
  
  console.log('Packet ID:', packetId);
  console.log('Payload size:', payload.length - 2, 'bytes');
  console.log('========================');
}
```

## Build

```bash
# Install dependencies
npm install

# Build library
npm run build

# Watch mode (auto rebuild on changes)
npm run watch
```

## Testing

```typescript
// test.ts - Simple test
import { PacketWriter, PacketReader } from './src';

// Test write and read
const writer = new PacketWriter(10001);
writer.writeString('Hello');
writer.writeUInt32(12345);
writer.writeBool(true);

const packet = writer.getBytes();
const payload = packet.slice(2);

const reader = new PacketReader(payload);
const packetId = reader.readUInt16();
const str = reader.readString();
const num = reader.readUInt32();
const bool = reader.readBool();

console.assert(packetId === 10001, 'Packet ID mismatch');
console.assert(str === 'Hello', 'String mismatch');
console.assert(num === 12345, 'Number mismatch');
console.assert(bool === true, 'Boolean mismatch');
console.assert(reader.isComplete(), 'Packet not fully read');

console.log('✅ All tests passed!');
```

## Performance Tips

1. **Reuse PacketWriter/Reader instances** when possible
2. **Pre-allocate arrays** when writing multiple items
3. **Batch packet sends** instead of sending many small packets
4. **Validate packet size** before sending (max 65535 bytes)
5. **Use appropriate data types** (don't use uint64 if uint32 is enough)

## Troubleshooting

### Problem: "Not enough data to read"
**Solution**: Make sure read order matches write order exactly

### Problem: "Packet not fully read"
**Solution**: Check if you're reading all fields that were written

### Problem: BigInt issues
**Solution**: Use `BigInt()` constructor or `n` suffix: `BigInt(12345)` or `12345n`

### Problem: String encoding errors
**Solution**: Ensure strings are valid UTF-8

## License

MIT
