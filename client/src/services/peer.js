class PeerConnection {
    constructor() {
        this.createPeerConnection();
    }

    createPeerConnection() {
        this.peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("New ICE candidate: ", event.candidate);
            }
        };
    }

    ensurePeerConnection() {
        if (!this.peer || this.peer.signalingState === "closed") {
            this.createPeerConnection(); // Create a new peer connection if it's closed
        }
    }

    async getOffer() {
        this.ensurePeerConnection();
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    async getAnswer(offer) {
        this.ensurePeerConnection();
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        return answer;
    }

    async setLocalDescription(ans) {
        this.ensurePeerConnection();
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }

    addTracks(stream) {
        this.ensurePeerConnection();
        stream.getTracks().forEach(track => {
            this.peer.addTrack(track, stream);
        });
    }

    closeConnection() {
        if (this.peer) {
            this.peer.close();
            this.peer = null; // Ensure it's set to null so it gets recreated when needed
        }
    }
}

const peer = new PeerConnection();
export default peer;
