

class SupplyChainException(Exception):
    """Base class for supply chain errors."""


class AgentTimeoutError(SupplyChainException):
    """Raised when an agent exceeds its allowed runtime."""


class AgentExecutionError(SupplyChainException):
    """Raised when an agent fails during execution."""


class DataNotFoundError(SupplyChainException):
    """Raised when requested data cannot be found."""
