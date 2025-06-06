import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/internal/withArgs";

describe("UniversityRegistry", function () {
  let universityRegistry: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let registrarRole: string;
  let universityAdminRole: string;

  beforeEach(async function () {
    // Get the signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the UniversityRegistry contract
    const UniversityRegistryFactory = await ethers.getContractFactory("UniversityRegistry");
    universityRegistry = await UniversityRegistryFactory.deploy();

    // Get the roles hash
    registrarRole = await universityRegistry.REGISTRAR_ROLE();
    universityAdminRole = await universityRegistry.UNIVERSITY_ADMIN_ROLE();

    // Ensure the owner has the necessary roles initially (granted in the contract constructor)
    expect(await universityRegistry.hasRole(await universityRegistry.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    expect(await universityRegistry.hasRole(registrarRole, owner.address)).to.be.true;
  });

  describe("Deployment", function () {
    it("Should set the right roles to the deployer", async function () {
      // The beforeEach block already verifies these roles are granted to the owner
    });
  });

  describe("University Registration", function () {
    const universityName = "Sample University";
    const universityCode = "SU";

    it("Should allow an account with REGISTRAR_ROLE to register a university", async function () {
      await expect(universityRegistry.connect(owner).registerUniversity(
        universityName,
        universityCode,
        addr1.address // University Admin address
      ))
      .to.emit(universityRegistry, "UniversityRegistered")
      .withArgs(universityCode, universityName, addr1.address, anyValue);

      // Verify university info
      const universityInfo = await universityRegistry.getUniversityInfo(universityCode);
      expect(universityInfo.name).to.equal(universityName);
      expect(universityInfo.code).to.equal(universityCode);
      expect(universityInfo.adminWallet).to.equal(addr1.address);
      expect(universityInfo.isActive).to.be.true;
      // Check registrationDate is not zero (approximate time check can be added if needed)
      expect(universityInfo.registrationDate).to.be.gt(0);

      // Verify UNIVERSITY_ADMIN_ROLE is granted to the admin wallet
      expect(await universityRegistry.hasRole(universityAdminRole, addr1.address)).to.be.true;
    });

    it("Should not allow an account without REGISTRAR_ROLE to register a university", async function () {
      await expect(universityRegistry.connect(addr1).registerUniversity(
        universityName,
        universityCode,
        addr1.address
      ))
      .to.be.reverted; // Expect revert without specific reason
    });

    it("Should not allow registering a university with an existing code", async function () {
      // Register the first university
      await universityRegistry.connect(owner).registerUniversity(
        universityName,
        universityCode,
        addr1.address
      );

      // Attempt to register another university with the same code
      await expect(universityRegistry.connect(owner).registerUniversity(
        "Another University",
        universityCode, // Same code
        addr2.address
      ))
      .to.be.reverted; // Expect revert without specific reason
    });

     it("Should correctly retrieve university information", async function () {
         await universityRegistry.connect(owner).registerUniversity(
             universityName,
             universityCode,
             addr1.address
         );

         const universityInfo = await universityRegistry.getUniversityInfo(universityCode);

         expect(universityInfo.name).to.equal(universityName);
         expect(universityInfo.code).to.equal(universityCode);
         expect(universityInfo.adminWallet).to.equal(addr1.address);
         expect(universityInfo.isActive).to.be.true;
     });

      it("Should revert when retrieving information for a non-existent university", async function () {
          await expect(universityRegistry.getUniversityInfo("NONEXISTENT")).to.be.revertedWith("University not found");
      });

  });

  describe("University Admin Update", function () {
      const universityName = "Sample University";
      const universityCode = "SU";

      beforeEach(async function () {
           // Register a university first
           await universityRegistry.connect(owner).registerUniversity(
               universityName,
               universityCode,
               addr1.address
           );
      });

      it("Should allow DEFAULT_ADMIN_ROLE to update university admin", async function () {
          await expect(universityRegistry.connect(owner).updateUniversityAdmin(universityCode, addr2.address))
          .to.emit(universityRegistry, "UniversityAdminUpdated")
          .withArgs(universityCode, addr1.address, addr2.address);

          // Verify the admin wallet is updated
          const universityInfo = await universityRegistry.getUniversityInfo(universityCode);
          expect(universityInfo.adminWallet).to.equal(addr2.address);

          // Verify roles are updated
          expect(await universityRegistry.hasRole(universityAdminRole, addr1.address)).to.be.false;
          expect(await universityRegistry.hasRole(universityAdminRole, addr2.address)).to.be.true;
      });

       it("Should allow the current UNIVERSITY_ADMIN_ROLE to update university admin", async function () {
            await expect(universityRegistry.connect(addr1).updateUniversityAdmin(universityCode, addr2.address))
            .to.emit(universityRegistry, "UniversityAdminUpdated")
            .withArgs(universityCode, addr1.address, addr2.address);

            // Verify the admin wallet is updated
            const universityInfo = await universityRegistry.getUniversityInfo(universityCode);
            expect(universityInfo.adminWallet).to.equal(addr2.address);

            // Verify roles are updated
            expect(await universityRegistry.hasRole(universityAdminRole, addr1.address)).to.be.false;
            expect(await universityRegistry.hasRole(universityAdminRole, addr2.address)).to.be.true;
       });

       it("Should not allow a non-admin account to update university admin", async function () {
            await expect(universityRegistry.connect(addr2).updateUniversityAdmin(universityCode, owner.address))
            .to.be.revertedWith("Caller is not admin or default admin"); // Check the specific revert message from the contract
       });

        it("Should revert when updating admin for a non-existent university", async function () {
             await expect(universityRegistry.connect(owner).updateUniversityAdmin("NONEXISTENT", addr2.address))
             .to.be.revertedWith("University not found");
        });

  });

   describe("University Status Update", function () {
       const universityName = "Sample University";
       const universityCode = "SU";

        beforeEach(async function () {
             // Register a university first
             await universityRegistry.connect(owner).registerUniversity(
                 universityName,
                 universityCode,
                 addr1.address
             );
        });

        it("Should allow REGISTRAR_ROLE to deactivate a university", async function () {
            await expect(universityRegistry.connect(owner).setUniversityStatus(universityCode, false))
            .to.emit(universityRegistry, "UniversityStatusUpdated")
            .withArgs(universityCode, false);

            // Verify university status is updated
            const universityInfo = await universityRegistry.getUniversityInfo(universityCode);
            expect(universityInfo.isActive).to.be.false;
        });

        it("Should allow REGISTRAR_ROLE to activate a university", async function () {
             // Deactivate first
             await universityRegistry.connect(owner).setUniversityStatus(universityCode, false);

             await expect(universityRegistry.connect(owner).setUniversityStatus(universityCode, true))
             .to.emit(universityRegistry, "UniversityStatusUpdated")
             .withArgs(universityCode, true);

             // Verify university status is updated
             const universityInfo = await universityRegistry.getUniversityInfo(universityCode);
             expect(universityInfo.isActive).to.be.true;
        });

        it("Should not allow a non-REGISTRAR_ROLE account to change university status", async function () {
             await expect(universityRegistry.connect(addr1).setUniversityStatus(universityCode, false))
             .to.be.reverted; // Expect revert without specific reason
        });

         it("Should revert when changing status for a non-existent university", async function () {
              await expect(universityRegistry.connect(owner).setUniversityStatus("NONEXISTENT", false))
              .to.be.revertedWith("University not found");
         });

   });

}); 