import loadEmpireData from "shared/data/loading/loadEmpireData";

/**
 * Sets up the data environment fully.
 * @returns The loaded empire data.
 */
export default function setupDataFully() {
    const [success, data] = loadEmpireData().await();
    if (!success) throw data;
    return data;
}
