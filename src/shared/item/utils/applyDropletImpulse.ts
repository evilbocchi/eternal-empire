import Packets from "shared/Packets";

export default function applyDropletImpulse(dropletModel: BasePart, impulse: Vector3) {
    const networkOwner = dropletModel.GetNetworkOwner();
    if (networkOwner !== undefined) Packets.applyImpulse.toClient(networkOwner, dropletModel.Name, impulse);
    else dropletModel.ApplyImpulse(impulse);
}
