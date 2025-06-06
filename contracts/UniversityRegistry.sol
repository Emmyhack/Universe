// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract UniversityRegistry is AccessControl, Pausable {

    // Define a role for university registration
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant UNIVERSITY_ADMIN_ROLE = keccak256("UNIVERSITY_ADMIN_ROLE");

    struct University {
        string name;
        string code;
        address adminWallet;
        bool isActive;
        uint256 registrationDate;
    }

    // Mapping from university code to University struct
    mapping(string => University) private universities;

    // Event for university registration
    event UniversityRegistered(string indexed code, string name, address indexed adminWallet, uint256 registrationDate);

    // Event for university admin update
    event UniversityAdminUpdated(string indexed code, address indexed oldAdmin, address indexed newAdmin);

    // Event for university activation/deactivation
    event UniversityStatusUpdated(string indexed code, bool isActive);

    constructor() payable {
        // Grant the deployer the DEFAULT_ADMIN_ROLE and REGISTRAR_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        // UNIVERSITY_ADMIN_ROLE is granted when a university is registered or updated
    }

    /**
     * @dev Registers a new university.
     * Only accounts with the REGISTRAR_ROLE can call this function.
     * @param _name The name of the university.
     * @param _code The unique code of the university.
     * @param _adminWallet The wallet address of the university administrator.
     */
    function registerUniversity(
        string memory _name,
        string memory _code,
        address _adminWallet
    ) public onlyRole(REGISTRAR_ROLE) whenNotPaused {
        require(bytes(_name).length > 0, "University name cannot be empty");
        require(bytes(_code).length > 0, "University code cannot be empty");
        require(_adminWallet != address(0), "Admin wallet cannot be zero address");
        require(universities[_code].adminWallet == address(0), "University code already exists");

        universities[_code] = University({
            name: _name,
            code: _code,
            adminWallet: _adminWallet,
            isActive: true, // Universities are active by default upon registration
            registrationDate: block.timestamp
        });

        // Grant UNIVERSITY_ADMIN_ROLE to the designated admin wallet
        _grantRole(UNIVERSITY_ADMIN_ROLE, _adminWallet);

        emit UniversityRegistered(_code, _name, _adminWallet, block.timestamp);
    }

    /**
     * @dev Updates the administrator wallet address for a registered university.
     * Only accounts with the DEFAULT_ADMIN_ROLE or the current university admin can call this function.
     * @param _code The unique code of the university.
     * @param _newAdminWallet The new wallet address for the university administrator.
     */
    function updateUniversityAdmin(string memory _code, address _newAdminWallet) public whenNotPaused {
        require(universities[_code].adminWallet != address(0), "University not found");
        require(_newAdminWallet != address(0), "New admin wallet cannot be zero address");
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || universities[_code].adminWallet == msg.sender, "Caller is not admin or default admin");

        address oldAdmin = universities[_code].adminWallet;
        universities[_code].adminWallet = _newAdminWallet;

        // Revoke the role from the old admin and grant to the new one
        _revokeRole(UNIVERSITY_ADMIN_ROLE, oldAdmin);
        _grantRole(UNIVERSITY_ADMIN_ROLE, _newAdminWallet);

        emit UniversityAdminUpdated(_code, oldAdmin, _newAdminWallet);
    }

    /**
     * @dev Retrieves the information of a registered university.
     * Anyone can call this function.
     * @param _code The unique code of the university.
     * @return University struct containing university details.
     */
    function getUniversityInfo(string memory _code) public view returns (University memory) {
         require(universities[_code].adminWallet != address(0), "University not found");
         return universities[_code];
    }

    /**
     * @dev Deactivates or activates a university.
     * Only accounts with the REGISTRAR_ROLE can call this function.
     * @param _code The unique code of the university.
     * @param _isActive The new activation status.
     */
    function setUniversityStatus(string memory _code, bool _isActive) public onlyRole(REGISTRAR_ROLE) whenNotPaused {
        require(universities[_code].adminWallet != address(0), "University not found");
        universities[_code].isActive = _isActive;
        emit UniversityStatusUpdated(_code, _isActive);
    }

    /**
     * @dev Checks if a university exists based on its code.
     * Anyone can call this function.
     * @param _code The unique code of the university.
     * @return bool True if the university exists, false otherwise.
     */
    function universityExists(string memory _code) public view returns (bool) {
        return universities[_code].adminWallet != address(0);
    }

    /**
     * @dev Pauses the contract. Only DEFAULT_ADMIN_ROLE can call this.
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) { 
        _pause();
    }

    /**
     * @dev Unpauses the contract. Only DEFAULT_ADMIN_ROLE can call this.
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) { 
        _unpause();
    }

    // TODO: Add more comprehensive access control based on roles
    // TODO: Add reentrancy guards where necessary (unlikely for this contract's current functions)
    // TODO: Add pausable functionality (optional)
    // TODO: Add more events for updates

} 