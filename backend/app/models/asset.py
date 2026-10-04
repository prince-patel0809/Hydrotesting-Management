from enum import Enum


class AssetStatus(str, Enum):
    ACTIVE = "Active"
    MAINTENANCE = "Maintenance"
    INACTIVE = "Inactive"
    DECOMMISSIONED = "Decommissioned"


class AssetType(str, Enum):
    STORAGE_TANK = "Storage Tank"
    FUEL_PIPELINE = "Fuel Pipeline"
    PRESSURE_VESSEL = "Pressure Vessel"
    DISPENSER_UNIT = "Dispenser Unit"
    TRANSFER_MANIFOLD = "Transfer Manifold"
    FILTER_SEPARATOR = "Filter Separator"
    VALVE_STATION = "Valve Station"
