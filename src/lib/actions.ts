"use server";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizePhoneNumber } from "./utils";
import { ALL_SERVICES_QUERYResult, PROJECT_BY_ID_QUERYResult } from "../../sanity.types";

interface QuotationProps {
  labTests: (ALL_SERVICES_QUERYResult[number] & {
    price: number;
    quantity: number;
  })[];
  fieldTests: (ALL_SERVICES_QUERYResult[number] & {
    price: number;
    quantity: number;
  })[];
  reportingActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  mobilizationActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  project: PROJECT_BY_ID_QUERYResult[number];
  currency: string;
  vatPercentage: number;
  paymentNotes: string;
  quotationNumber: string;
  quotationDate: string;
  acquisitionNumber: string;
  revisionNumber: string;
}

// CREATE QUOTATION
export async function createQuotation(billingInfo: QuotationProps, fileId: string) {
  try {
    const {
      labTests,
      fieldTests,
      reportingActivities,
      mobilizationActivities,
      project,
      currency,
      vatPercentage,
      paymentNotes,
      quotationNumber,
      quotationDate,
      acquisitionNumber,
      revisionNumber,
    } = billingInfo;

    const labTestMethod = labTests.map((test) => test.testMethods?.find((method: any) => method.selected))[0]?._id;

    const fieldTestMethod = fieldTests.map((test) => test.testMethods?.find((method: any) => method.selected))[0]?._id;

    const items = [
      ...labTests.map((test) => ({
        _type: "serviceItem",
        service: {
          _type: "reference",
          _ref: test._id,
        },
        testMethod: {
          _type: "reference",
          _ref: labTestMethod,
        },
        unitPrice: test.price,
        quantity: test.quantity,
        lineTotal: test.price * test.quantity,
      })),
      ...fieldTests.map((field) => ({
        _type: "serviceItem",
        service: {
          _type: "reference",
          _ref: field._id,
        },
        testMethod: {
          _type: "reference",
          _ref: fieldTestMethod,
        },
        unitPrice: field.price,
        quantity: field.quantity,
        lineTotal: field.price * field.quantity,
      })),
    ];

    const otherItems = [
      ...reportingActivities.map((reporting) => ({
        _type: "otherItem",
        type: "reporting",
        activity: reporting.activity,
        unitPrice: reporting.price,
        quantity: reporting.quantity,
        lineTotal: reporting.price * reporting.quantity,
      })),
      ...mobilizationActivities.map((mobilization) => ({
        _type: "otherItem",
        type: "mobilization",
        activity: mobilization.activity,
        unitPrice: mobilization.price,
        quantity: mobilization.quantity,
        lineTotal: mobilization.price * mobilization.quantity,
      })),
    ];

    const quotation = await writeClient.create(
      {
        _type: "quotation",
        revisionNumber,
        quotationNumber,
        quotationDate,
        acquisitionNumber,
        currency: currency.toLowerCase(),
        status: "draft",
        items,
        otherItems,
        vatPercentage,
        paymentNotes,
        file: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        },
      },
      {
        autoGenerateArrayKeys: true,
      }
    );

    await writeClient
      .patch(project._id)
      .set({
        quotation: {
          _type: "reference",
          _ref: quotation._id,
        },
      })
      .commit();
    revalidateTag(`project-${project._id}`);
    return { result: quotation, status: "ok" };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return { error, status: "error" };
  }
}

// SEND QUOTATION
export async function sendQuotation(projectId: string) {
  try {
    await writeClient
      .patch(projectId as string)
      .set({
        status: "sent",
      })
      .commit();
    // revalidatePath(`/projects/${projectId}`);
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error sending quotation:", error);
    return { error, status: "error" };
  }
}

// UPDATE QUOTATION
export async function updateQuotation(quotationId: string, billingInfo: QuotationProps, fileId: string) {
  try {
    const {
      labTests,
      fieldTests,
      reportingActivities,
      mobilizationActivities,
      project,
      currency,
      vatPercentage,
      paymentNotes,
      quotationNumber,
      quotationDate,
      acquisitionNumber,
      revisionNumber,
    } = billingInfo;

    const labTestMethod = labTests.map((test) => test.testMethods?.find((method: any) => method.selected))[0]?._id;

    const fieldTestMethod = fieldTests.map((test) => test.testMethods?.find((method: any) => method.selected))[0]?._id;

    const items = [
      ...labTests.map((test) => ({
        _type: "serviceItem",
        service: {
          _type: "reference",
          _ref: test._id,
        },
        testMethod: {
          _type: "reference",
          _ref: labTestMethod,
        },
        unitPrice: test.price,
        quantity: test.quantity,
        lineTotal: test.price * test.quantity,
      })),
      ...fieldTests.map((field) => ({
        _type: "serviceItem",
        service: {
          _type: "reference",
          _ref: field._id,
        },
        testMethod: {
          _type: "reference",
          _ref: fieldTestMethod,
        },
        unitPrice: field.price,
        quantity: field.quantity,
        lineTotal: field.price * field.quantity,
      })),
    ];

    const otherItems = [
      ...reportingActivities.map((reporting) => ({
        _type: "otherItem",
        type: "reporting",
        activity: reporting.activity,
        unitPrice: reporting.price,
        quantity: reporting.quantity,
        lineTotal: reporting.price * reporting.quantity,
      })),
      ...mobilizationActivities.map((mobilization) => ({
        _type: "otherItem",
        type: "mobilization",
        activity: mobilization.activity,
        unitPrice: mobilization.price,
        quantity: mobilization.quantity,
        lineTotal: mobilization.price * mobilization.quantity,
      })),
    ];

    // If the file is referenced, unlink it from the quotation
    await writeClient
      .patch(quotationId as string)
      .unset(["file"])
      .commit();

    // first delete the old pdf file from the quotation
    await writeClient.delete(project.quotation?.file?.asset?._id || "");

    await writeClient
      .patch(quotationId as string)
      .set({
        status: "draft",
        revisionNumber,
        quotationNumber,
        quotationDate,
        acquisitionNumber,
        currency: currency.toLowerCase(),
        items,
        otherItems,
        vatPercentage,
        paymentNotes,
        file: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        },
      })
      .commit({ autoGenerateArrayKeys: true });
    revalidateTag(`project-${project._id}`);
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error sending quotation:", error);
    return { error, status: "error" };
  }
}

// CREATE STANDARD
export async function addStandard(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name");
    const acronym = formData.get("acronym");
    const description = formData.get("description");

    const standard = await writeClient.create(
      {
        _type: "standard",
        name,
        acronym,
        description,
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("standards");
    return { result: standard, status: "ok" };
  } catch (error) {
    console.error("Error adding standard:", error);
    return { error, status: "error" };
  }
}

// DELETE STANDARD
export async function deleteStandard(standardId: string) {
  try {
    const result = await writeClient.delete(standardId);
    revalidateTag("standards");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting standard:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE STANDARDS
export async function deleteMultipleStandards(standardIds: string[]) {
  try {
    const results = await Promise.all(
      standardIds.map(async (standardId) => {
        const result = await writeClient.delete(standardId);
        return result;
      })
    );
    revalidateTag("standards");
    return { results, status: "ok" };
  } catch (error) {
    console.error("Error deleting standards:", error);
    return { error, status: "error" };
  }
}

// UPDATE STANDARD
export async function updateStandard(prevState: any, formData: FormData) {
  try {
    const standardId = formData.get("standardId");
    const name = formData.get("name");
    const acronym = formData.get("acronym");
    const description = formData.get("description");

    const result = await writeClient
      .patch(standardId as string)
      .set({ name, acronym, description })
      .commit();
    revalidateTag("standards");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating standard:", error);
    return { error, status: "error" };
  }
}

// ADD TEST METHOD
export async function addTestMethod(prevState: any, formData: FormData) {
  try {
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const standardId = formData.get("standard") as string;
    const fileIds = formData.getAll("documents") as string[];

    // Create the testMethod document
    const testMethod = await writeClient.create(
      {
        _type: "testMethod",
        code,
        description,
        standard: {
          _type: "reference",
          _ref: standardId,
        },
        documents: fileIds.map((fileId) => ({
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        })),
      },
      {
        autoGenerateArrayKeys: true,
      }
    );

    return { result: testMethod, status: "ok" };
  } catch (error) {
    console.error("Error adding test method:", error);
    return { error, status: "error" };
  }
}

// UPDATE TEST METHOD
export async function updateTestMethod(prevState: any, formData: FormData) {
  const code = formData.get("code");
  const description = formData.get("description");
  const standardId = formData.get("standard");
  const testMethodId = formData.get("testMethodId");
  try {
    const result = await writeClient
      .patch(testMethodId as string)
      .set({
        code,
        description,
        standard: { _type: "reference", _ref: standardId },
      })
      .commit();
    revalidateTag("testMethods");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating test method:", error);
    return { error, status: "error" };
  }
}

// DELETE TEST METHOD
export async function deleteTestMethod(testMethodId: string) {
  try {
    // 1. Fetch asset IDs before deleting the document
    const method = await writeClient.fetch(
      `*[_type == "testMethod" && _id == $id][0] {
        documents[]{
          asset->{
            _id
          }
        }
      }`,
      { id: testMethodId }
    );

    const assetIds: string[] = method?.documents?.map((doc: any) => doc.asset?._id).filter(Boolean);

    // 2. Delete the testMethod document first
    const result = await writeClient.delete(testMethodId);

    // 3. Then check and delete unreferenced assets
    if (assetIds?.length) {
      await Promise.all(
        assetIds.map(async (assetId) => {
          const refCount = await writeClient.fetch(`count(*[references($assetId)])`, { assetId });

          if (refCount === 0) {
            await writeClient.delete(assetId);
          }
        })
      );
    }

    // 4. Revalidate cache
    revalidateTag("testMethods");

    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting test method:", error);
    return { error, status: "error" };
  }
}

// GET TEST METHODS REFERENCING FILE
export async function getTestMethodsReferencingFile(fileId: string) {
  return await writeClient.fetch(
    `*[_type == "testMethod" && references($id)] {
      _id,
      _type,
      code,
      testParameter
    }`,
    { id: fileId }
  );
}

// GET DOCUMENTS REFERENCING TEST METHOD
export async function getDocumentsReferencingTestMethod(testMethodId: string) {
  return await writeClient.fetch(
    `*[_type != "testMethod" && references($id)] {
      _id,
      _type,
      code,
      testParameter
    }`,
    { id: testMethodId }
  );
}

// GET DOCUMENTS REFERENCING MULTIPLE TEST METHODS
export async function getDocumentsReferencingMultipleTestMethods(testMethodIds: string[]) {
  const results = await Promise.all(
    testMethodIds.map(async (id) => {
      const documents = await writeClient.fetch(
        `*[_type != "testMethod" && references($id)] {
          _id,
          _type,
          code,
          testParameter
        }`,
        { id }
      );
      return { testMethodId: id, documents }; // Return an object with the testMethodId and its documents
    })
  );
  return results; // Return the array of objects
}

// DELETE MULTIPLE TEST METHODS
export async function deleteMultipleTestMethods(testMethodIds: string[]) {
  try {
    const results = await Promise.all(
      testMethodIds.map(async (testMethodId) => {
        const documents = await getDocumentsReferencingTestMethod(testMethodId);

        if (documents.length === 0) {
          // 1. Fetch asset IDs before deleting the document
          const method = await writeClient.fetch(
            `*[_type == "testMethod" && _id == $id][0] {
            documents[]{
              asset->{
                _id
              }
            }
          }`,
            { id: testMethodId }
          );

          const assetIds: string[] = method?.documents?.map((doc: any) => doc.asset?._id).filter(Boolean);

          // 2. Delete the testMethod document first
          const result = await writeClient.delete(testMethodId);

          // 3. Then check and delete unreferenced assets
          if (assetIds?.length) {
            await Promise.all(
              assetIds.map(async (assetId) => {
                const refCount = await writeClient.fetch(`count(*[references($assetId)])`, { assetId });

                if (refCount === 0) {
                  await writeClient.delete(assetId);
                }
              })
            );
          }

          return { result, deleted: true }; // Indicate that a test method was deleted
        }
        return { deleted: false }; // Indicate that no test method was deleted
      })
    );

    const anyDeleted = results.some((res) => res.deleted);
    revalidateTag("testMethods");
    return {
      results,
      status: anyDeleted ? "ok" : "no_deletions",
      deletedItems: results.filter((res) => res.deleted).length,
    }; // Return different status if no deletions occurred
  } catch (error) {
    console.error("Error deleting test methods:", error);
    return { error, status: "error" };
  }
}

// REMOVE TEST METHOD FROM SERVICE
export async function deleteTestMethodFromService(serviceId: string, testMethodId: string) {
  try {
    const result = await writeClient
      .patch(serviceId)
      .unset([`testMethods[_ref == "${testMethodId}"]`])
      .commit();
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting test method:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE TEST METHODS FROM SERVICE
export async function deleteMultipleTestMethodsFromService(serviceId: string, testMethodIds: string[]) {
  try {
    const results = await Promise.all(
      testMethodIds.map(async (testMethodId) => {
        const result = await writeClient
          .patch(serviceId)
          .unset([`testMethods[_ref == "${testMethodId}"]`])
          .commit();
        return result;
      })
    );
    revalidateTag("testMethods");
    return { results, status: "ok" };
  } catch (error) {
    console.error("Error deleting test methods:", error);
    return { error, status: "error" };
  }
}

// ADD FILES TO TEST METHOD
export async function addFilesToTestMethod(prevState: any, formData: FormData) {
  const testMethodId = formData.get("testMethodId") as string;
  const fileIds = formData.getAll("documents") as string[];

  try {
    const files = fileIds.map((fileId) => ({
      _type: "file",
      asset: {
        _type: "reference",
        _ref: fileId,
      },
    }));

    const result = await writeClient
      .patch(testMethodId)
      .append("documents", files)
      .commit({ autoGenerateArrayKeys: true });

    return { result, status: "success" };
  } catch (error) {
    console.error("Error adding files to test method:", error);
    return { error, status: "error" };
  }
}

// DELETE FILE
export async function deleteFileFromTestMethod(fileId: string, fileKey: string, currentTestMethodId: string) {
  try {
    // Check if the file is referenced by any test method other than the current one
    const documents = await writeClient.fetch(
      `*[_type == "testMethod" && references($fileId) && _id != $currentId] {
        _id,
        _type,
        code,
        testParameter
      }`,
      { fileId, currentId: currentTestMethodId }
    );

    if (documents.length > 0) {
      // If the file is referenced by other test methods, unlink it from the current test method
      const result = await writeClient
        .patch(currentTestMethodId)
        .unset([`documents[_key == "${fileKey}"]`])
        .commit();

      console.log(result);
      revalidateTag("testMethods");
      return { result, status: "ok" };
    } else {
      await writeClient
        .patch(currentTestMethodId)
        .unset([`documents[_key == "${fileKey}"]`])
        .commit();
      const result = await writeClient.delete(fileId);
      revalidateTag("testMethods");
      return { result, status: "ok" };
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return { error, status: "error" };
  }
}

// ADD SAMPLE CLASS
export async function addSampleClass(prevState: any, formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");
  const subclassesRaw = formData.get("subclasses");

  let subclasses = [];
  try {
    subclasses = JSON.parse(subclassesRaw as string);
  } catch (e) {
    return { status: "error", message: "Invalid subclasses data" };
  }

  try {
    const result = await writeClient.create(
      {
        _type: "sampleClass",
        name,
        description,
        subclasses: subclasses.map((sc: { name: string; key: string }) => ({
          _type: "subclass",
          name: sc.name,
          key: sc.key,
        })),
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error adding sample class:", error);
    return { error, status: "error" };
  }
}

// DELETE SAMPLE CLASS
export async function deleteSampleClass(sampleClassId: string) {
  try {
    const result = await writeClient.delete(sampleClassId);
    revalidateTag("sampleClasses");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting sample class:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE SAMPLE CLASSES
export async function deleteMultipleSampleClasses(sampleClassIds: string[]) {
  try {
    const results = await Promise.all(
      sampleClassIds.map(async (sampleClassId) => {
        const documents = await getDocumentsReferencingSampleClass(sampleClassId);
        if (documents.length === 0) {
          const result = await writeClient.delete(sampleClassId);
          return { result, deleted: true };
        }
        return { deleted: false };
      })
    );

    const anyDeleted = results.some((res) => res.deleted);
    revalidateTag("sampleClasses");
    return {
      results,
      status: anyDeleted ? "ok" : "no_deletions",
      deletedItems: results.filter((res) => res.deleted).length,
    };
  } catch (error) {
    console.error("Error deleting sample classes:", error);
    return { error, status: "error" };
  }
}

// GET DOCUMENTS REFERENCING SAMPLE CLASS
export async function getDocumentsReferencingSampleClass(sampleClassId: string) {
  return await writeClient.fetch(
    `*[_type != "sampleClass" && references($id)] {
      _id,
      _type,
      code,
      testParameter
    }`,
    { id: sampleClassId }
  );
}

// GET DOCUMENTS REFERENCING MULTIPLE SAMPLE CLASSES
export async function getDocumentsReferencingMultipleSampleClasses(sampleClassIds: string[]) {
  const results = await Promise.all(
    sampleClassIds.map(async (id) => {
      const documents = await writeClient.fetch(
        `*[_type != "sampleClass" && references($id)] {
          _id,
          _type,
          code,
          testParameter
        }`,
        { id }
      );
      return { sampleClassId: id, documents }; // Return an object with the testMethodId and its documents
    })
  );
  return results; // Return the array of objects
}

// UPDATE SAMPLE CLASS
export async function updateSampleClass(prevState: any, formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");
  const subclassesRaw = formData.get("subclasses");
  const sampleClassId = formData.get("sampleClassId");
  let subclasses = [];
  try {
    subclasses = JSON.parse(subclassesRaw as string);
  } catch (e) {
    return { status: "error", message: "Invalid subclasses data" };
  }
  try {
    const result = await writeClient
      .patch(sampleClassId as string)
      .set({ name, description, subclasses })
      .commit();
    revalidateTag("sampleClasses");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating sample class:", error);
    return { error, status: "error" };
  }
}

// ADD SERVICE
export async function addService(prevState: any, formData: FormData) {
  const code = formData.get("code");
  const testParameter = formData.get("testParameter");
  const testMethods = formData.getAll("testMethods").map((testMethod) => JSON.parse(testMethod as string));
  const sampleClass = formData.get("sampleClass");
  const status = formData.get("status");

  try {
    const result = await writeClient.create(
      {
        _type: "service",
        code,
        testParameter,
        testMethods: testMethods.map((m) => ({
          _type: "reference",
          _ref: m.testMethod,
        })),
        sampleClass: {
          _type: "reference",
          _ref: sampleClass,
        },
        status,
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("services");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error adding service:", error);
    return { error, status: "error" };
  }
}

// UPDATE SERVICE
export async function updateService(prevState: any, formData: FormData) {
  const code = formData.get("code");
  const testParameter = formData.get("testParameter");
  const testMethods = formData.getAll("testMethods").map((testMethod) => JSON.parse(testMethod as string));
  const sampleClass = formData.get("sampleClass");
  const status = formData.get("status");
  const serviceId = formData.get("serviceId");
  try {
    const result = await writeClient
      .patch(serviceId as string)
      .set({
        code,
        testParameter,
        testMethods: testMethods.map((m) => ({
          _type: "reference",
          _ref: m.testMethod,
        })),
        sampleClass: {
          _type: "reference",
          _ref: sampleClass,
        },
        status,
      })
      .commit();
    revalidateTag("services");
    revalidateTag(`service-${serviceId}`);
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating service:", error);
    return { error, status: "error" };
  }
}

// DELETE SERVICE
export async function deleteService(serviceId: string) {
  try {
    const result = await writeClient.delete(serviceId);
    revalidateTag("services");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE SERVICES
export async function deleteMultipleServices(serviceIds: string[]) {
  try {
    const results = await Promise.all(
      serviceIds.map(async (serviceId) => {
        const result = await writeClient.delete(serviceId);
        return result;
      })
    );
    revalidateTag("services");
    return { results, status: "ok" };
  } catch (error) {
    console.error("Error deleting services:", error);
    return { error, status: "error" };
  }
}

// ACTIVATE DEACTIVATE SERVICE
export async function activateDeactivateService(prevState: any, formData: FormData) {
  const serviceId = formData.get("serviceId");
  const status = formData.get("status");
  try {
    const result = await writeClient
      .patch(serviceId as string)
      .set({ status: status as string })
      .commit();
    revalidateTag("services");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error activating/deactivating service:", error);
    return { error, status: "error" };
  }
}

// UPLOAD PDF DOCUMENT
export async function uploadPDFDocument(pdfBlob: Blob, filename: string) {
  try {
    // Upload PDF to Sanity
    const document = await writeClient.assets.upload("file", pdfBlob, {
      filename,
      contentType: "application/pdf",
    });

    console.log("PDF uploaded:", document);
    return { result: document, status: "ok" };
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return { error, status: "error" };
  }
}

export async function deleteAsset() {
  try {
    const asset = await writeClient.delete("file-02b0d0933047999d4815962463e31219ca1adc6a-pdf");
    console.log("Asset deleted:", asset);
    return { result: asset, status: "ok" };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { error, status: "error" };
  }
}

export async function setProjectDateRange(prevState: any, formData: FormData) {
  try {
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const projectId = formData.get("projectId");

    console.log(projectId);

    const result = await writeClient
      .patch(projectId as string)
      .set({
        startDate: (dateFrom as string) || null,
        endDate: (dateTo as string) || null,
      })
      .commit();
    console.log("Project Date Range Set", result);
    return { result: result, status: "ok" };
  } catch (error) {
    console.error("Error setting date-range:", error);
    return { error, status: "error" };
  }
}

export async function createProject(prevState: any, formData: FormData) {
  try {
    const internalId = formData.get("internalId");
    const projectName = formData.get("projectName");
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const clients = formData.getAll("clients").map((client) => JSON.parse(client as string));

    const clientIds = await Promise.all(
      clients.map(async (client) => {
        if (client.clientType === "new") {
          // Create the new client
          const newClient = await writeClient.create({
            _type: "client",
            name: client.newClientName,
          });
          return newClient._id; // Return the new client's ID
        } else {
          // Use existing client ID
          return client.existingClient;
        }
      })
    );

    // Create the project
    const project = await writeClient.create(
      {
        _type: "project",
        internalId,
        name: projectName,
        startDate: dateFrom || null,
        endDate: dateTo || null,
        stagesCompleted: [], // Placeholder logic
        clients: clientIds.map((clientId) => ({
          _type: "reference",
          _ref: clientId,
        })), // Reference clients
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("projects");
    return { result: project, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function updateClientName(clientId: string, projectId: string, formData: FormData) {
  try {
    const clientName = formData.get("clientName");
    const result = await writeClient
      .patch(clientId as string)
      .set({ name: clientName as string })
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function updateContactPerson(contactId: string, projectId: string, formData: FormData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const designation = formData.get("designation");
    const result = await writeClient
      .patch(contactId)
      .set({
        name,
        email,
        phone: sanitizePhoneNumber(phone as string),
        designation,
      })
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function removeContactFromProject(contactId: string, projectId: string) {
  try {
    const result = await writeClient
      .patch(projectId)
      .unset([`contactPersons[_ref == "${contactId}"]`])
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function removeClientFromProject(clientId: string, projectId: string) {
  try {
    const result = await writeClient
      .patch(projectId)
      .unset([`clients[_ref == "${clientId}"]`])
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const result = await writeClient.delete(projectId);
    // TODO: Is there a need to revalidate projects?
    revalidateTag(`projects`);
    return { result, status: "ok" };
  } catch (error) {
    console.log(error);
    return { error, status: "error" };
  }
}

export async function revalidateProjects() {
  revalidateTag("projects");
}

export async function revalidateProject(projectId: string) {
  revalidateTag(`project-${projectId}`);
}

export async function revalidateAll() {
  revalidatePath("/");
  redirect("/");
}
