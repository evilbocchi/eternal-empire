import Packets from "shared/Packets";

export default function setDropletVelocity(dropletModel: BasePart, velocity: Vector3) {
    const networkOwner = dropletModel.GetNetworkOwner();
    if (networkOwner !== undefined) Packets.setVelocity.toClient(networkOwner, dropletModel.Name, velocity);
    else dropletModel.AssemblyLinearVelocity = velocity;
}
