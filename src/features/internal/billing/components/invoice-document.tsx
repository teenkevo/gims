import React from "react";
import { Image, Text, View, Page, StyleSheet, Font } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { format } from "date-fns";
import { numberToWords } from "../../projects/constants";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { currencyCodeToName } from "@/lib/utils";
const tw = createTw({
  theme: {
    extend: {
      colors: {
        custom: "#bada55",
      },
    },
  },
});
// Register font
Font.register({
  family: "SpaceGrotesk",
  fonts: [
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Light.ttf",
      fontWeight: 300,
    },
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Medium.ttf",
      fontWeight: 500,
    },
    {
      src: "https://getlab.b-cdn.net/SpaceGrotesk-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

export interface Test {
  service: {
    _id: string;
    testParameter: string | null;
    sampleClass: {
      _id: string;
      name: string | null;
    } | null;
  } | null;
  unitPrice: number | null;
  quantity: number | null;
  lineTotal: number | null;
  testMethod: {
    _id: string;
    standard: {
      _id: string;
      acronym: string | null;
    } | null;
  } | null;
}

interface Activity {
  type: "mobilization" | "reporting" | null;
  activity: string | null;
  unitPrice: number | null;
  quantity: number | null;
  lineTotal: number | null;
}

interface BillingDocumentProps {
  labTests: Test[];
  fieldTests: Test[];
  reportingActivities: Activity[];
  mobilizationActivities: Activity[];
  project: PROJECT_BY_ID_QUERYResult[number];
  currency: string;
  paymentNotes: string;
  vatPercentage: number;
  advance: number;
  quotationNumber: string;
  quotationDate: string;
  acquisitionNumber: string;
  revisionNumber: string;
  isInvoice: boolean;
}

export const InvoiceDocument = (billingInfo: BillingDocumentProps) => {
  const {
    quotationNumber,
    quotationDate,
    acquisitionNumber,
    currency,
    paymentNotes,
    vatPercentage,
    advance,
    labTests,
    fieldTests,
    reportingActivities,
    mobilizationActivities,
    project,
    revisionNumber,
    isInvoice,
  } = billingInfo;

  const billing_data = {
    revision_number: revisionNumber,
    acquisition_number: acquisitionNumber,
    quotation_date: quotationDate,
    quotation_number: quotationNumber,
    items: {
      mobilizationActivities,
      fieldTests,
      labTests,
      reportingActivities,
    },
  };

  const generateInvoice = isInvoice;

  const mobilization = billing_data.items.mobilizationActivities || [];
  const field = billing_data.items.fieldTests || [];
  const lab = billing_data.items.labTests || [];
  const reporting = billing_data.items.reportingActivities || [];

  const calculateBill = (items: (Test | Activity)[]) =>
    items.reduce(
      (sum: number, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
      0
    );

  const SUBTOTAL =
    (calculateBill(mobilization) || 0) +
    (calculateBill(field) || 0) +
    (calculateBill(lab) || 0) +
    (calculateBill(reporting) || 0);

  const VAT_AMOUNT = Math.round((SUBTOTAL * vatPercentage) / 100);
  const TOTAL_WITH_VAT = Math.round(SUBTOTAL + VAT_AMOUNT);

  const styles = StyleSheet.create({
    page: {
      fontSize: 11,
      paddingTop: 30,
      paddingBottom: 65,
      paddingHorizontal: 35,
      lineHeight: 1.2,
      flexDirection: "column",
      fontFamily: "SpaceGrotesk",
    },

    heading: {
      color: "#43AC33",
      fontWeight: 700,
      fontSize: 12,
      marginBottom: 5,
    },

    subHeading: {
      color: "black",
      fontSize: 9,
      fontWeight: 600,
      marginBottom: 5,
    },

    spaceBetweenNoAlign: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      color: "#3E3E3E",
    },

    spaceBetween: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      color: "#3E3E3E",
    },

    header: {
      flexDirection: "row",
      textAlign: "right",
      borderRadius: 10,
      flex: 2,
      justifyContent: "space-between",
      marginBottom: 10,
    },

    titleContainer: { flexDirection: "row", marginTop: 10 },

    logo: { width: 150, marginBottom: 20 },

    reportTitle: {
      fontSize: 25,
      fontWeight: 600,
      textAlign: "center",
      color: "#43AC33",
    },

    addressTitle: { fontSize: 8, fontWeight: 400 },
    metaTitle: { fontSize: 9, fontWeight: 600 },
    metaDescription: { fontSize: 9, fontWeight: 400 },

    invoice: { fontWeight: 400, fontSize: 20 },

    invoiceNumber: {
      fontSize: 11,
      fontWeight: 400,
    },

    quotationDetail: {
      fontSize: 8,
      fontWeight: 400,
    },

    address: { fontWeight: 400, fontSize: 10 },

    theader: {
      marginTop: 5,
      fontSize: 7,
      fontWeight: 500,
      paddingTop: 4,
      paddingLeft: 5,
      paddingRight: 5,
      flex: 1,
      height: 20,
      backgroundColor: "#E1EBE3",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },

    theader2: { flex: 4, borderRightWidth: 1, borderBottomWidth: 1 },

    tbody: {
      fontSize: 8,
      fontWeight: 400,
      paddingTop: 2,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    tbodyRightAlign: {
      fontSize: 8,
      fontWeight: 400,
      paddingTop: 2,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
      textAlign: "right",
    },

    tbody2: { flex: 4, borderRightWidth: 1 },

    tbodyTotal: {
      fontSize: 8,
      fontWeight: 700,
      paddingTop: 7,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
      textAlign: "right",
    },

    tbodyTotalWithVAT: {
      fontSize: 8,
      fontWeight: 700,
      color: "#43AC33",
      paddingTop: 7,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
      textAlign: "right",
    },

    total: {
      fontSize: 8,
      fontWeight: 700,
      paddingTop: 7,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      textAlign: "right",
    },
    total2: {
      fontSize: 8,
      fontWeight: 700,
      paddingTop: 7,
      paddingLeft: 7,
      paddingRight: 7,
      flex: 4,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      textAlign: "right",
    },

    flex: {
      display: "none",
    },

    boldStartingText: {
      fontSize: 10,
      fontWeight: 700,
      marginRight: 1,
    },

    subsection: {
      fontSize: 9,
      textAlign: "center",
      paddingTop: 4,
      paddingLeft: 7,
      paddingBottom: 4,
      flex: 1.5,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
      fontWeight: 600,
      fontFamily: "SpaceGrotesk",
      backgroundColor: "whitesmoke",
    },

    noItems: {
      fontSize: 8,
      textAlign: "center",
      paddingTop: 10,
      paddingLeft: 7,
      paddingBottom: 10,
      flex: 1.5,
      fontFamily: "SpaceGrotesk",
    },

    pageNumber: {
      position: "absolute",
      fontSize: 10,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      color: "grey",
    },
    title: {
      fontSize: 20,
      fontWeight: 600,
    },

    spaceY: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    },
  });

  /* eslint-disable jsx-a11y/alt-text */
  const Header = () => (
    <View style={styles.header}>
      <View>
        <Image style={tw("w-32 mb-4")} src="/getlab-logo.png" />
        <Text style={styles.subHeading}>
          Geotechnical Engineering and Technology Laboratory (GETLAB) Limited
        </Text>
        <Text style={styles.addressTitle}>
          Plot 1234, Block 197, Namirembe Hillside Road Kitetika Cell,
        </Text>
        <Text style={styles.addressTitle}>
          Kasangati Town Council, Wakiso, Uganda
        </Text>
        <Text style={styles.addressTitle}>Tel: +256 (0) 392 175 883</Text>
        <Text style={styles.addressTitle}>
          Email: info@getlab.co.ug Web: www.getlab.co.ug
        </Text>
        <Text style={{ ...styles.subHeading, fontSize: 8, marginTop: 5 }}>
          TIN Number: 1006958253
        </Text>
      </View>
      <View>
        <Text style={[styles.title]}>
          {generateInvoice ? "INVOICE" : "QUOTATION"}
        </Text>
        <View style={tw("flex flex-row mt-9")}>
          <Text style={styles.metaTitle}>Revision No:</Text>
          <Text style={styles.metaDescription}>
            {" "}
            {billing_data.revision_number}
          </Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>Acquisition No:</Text>
          <Text style={styles.metaDescription}> {acquisitionNumber}</Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>
            {generateInvoice ? "Invoice No:" : "Quotation No:"}
          </Text>
          <Text style={styles.metaDescription}> {quotationNumber}</Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>
            {generateInvoice ? "Invoice Date:" : "Quotation Date:"}
          </Text>
          <Text style={styles.metaDescription}>
            {" "}
            {format(new Date(quotationDate), "MMM d, yyyy, h:mma")}
          </Text>
        </View>
      </View>
    </View>
  );

  /* eslint-enable jsx-a11y/alt-text */

  const ClientAddressAndProject = () => (
    <View style={[styles.spaceBetweenNoAlign, { marginBottom: 20 }]}>
      <View
        style={{
          width: "48%",
          border: "1px solid #43AC33",
          backgroundColor: "#e1ebe3",
          padding: 15,
          height: "80px",
          borderRadius: 10,
        }}
      >
        <Text style={{ ...styles.heading, marginBottom: 15 }}>
          {generateInvoice ? "Invoice" : "Quotation"} to
        </Text>
        {/* {project?.clients?.map((client) => (
          <View key={client._id}>
            <Text style={styles.subHeading}>{client.name}</Text>
            <Text style={styles.addressTitle}>
              Email: {project?.contactPersons?.[0]?.email}
            </Text>
          </View>
        ))} */}
        <Text style={styles.subHeading}>{project?.clients?.[0]?.name}</Text>
        <Text style={styles.addressTitle}>
          Email: {project?.contactPersons?.[0]?.email}
        </Text>
      </View>

      <View
        style={{
          width: "48%",
          border: "1px solid #43AC33",
          backgroundColor: "#e1ebe3",
          padding: 15,
          borderRadius: 10,
          height: "80px",
        }}
      >
        <Text style={{ ...styles.heading, marginBottom: 15 }}>For Project</Text>
        <Text style={styles.subHeading}>{project.name}</Text>
      </View>
    </View>
  );

  const TableHead = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={styles.theader}>
        <Text>QUANTITY</Text>
      </View>
      <View style={styles.theader}>
        <Text>UNITS</Text>
      </View>
      <View style={[styles.theader, styles.theader2]}>
        <Text>DESCRIPTION</Text>
      </View>
      <View style={styles.theader}>
        <Text>UNIT PRICE ({currency.toUpperCase()})</Text>
      </View>
      <View style={styles.theader}>
        <Text>AMOUNT ({currency.toUpperCase()})</Text>
      </View>
    </View>
  );
  const TableBodyWithListItems = ({ items }: { items: (Test | Activity)[] }) =>
    items.length === 0 ? (
      <NoItems text="No items" />
    ) : (
      items?.map((item, index: number) => (
        <View key={index} style={{ width: "100%", flexDirection: "row" }}>
          <View style={styles.tbody}>
            <Text>{item.quantity}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>No</Text>
          </View>
          <View style={[styles.tbody, styles.tbody2]}>
            <Text>
              {"service" in item ? item.service?.testParameter : item.activity}
            </Text>
          </View>
          <View style={styles.tbodyRightAlign}>
            <Text>{item.unitPrice?.toLocaleString() || "0"} </Text>
          </View>
          <View style={styles.tbodyRightAlign}>
            <Text>
              {((item.unitPrice || 0) * (item.quantity || 0))?.toLocaleString()}
            </Text>
          </View>
        </View>
      ))
    );

  const TableTotal = () => (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        borderTopWidth: 1,
        borderColor: "whitesmoke",
      }}
    >
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={[styles.total, styles.total2]}>
        <Text></Text>
      </View>
      <View style={styles.tbodyTotal}>
        <Text>Subtotal</Text>
      </View>
      <View style={styles.tbodyTotal}>
        <Text>{SUBTOTAL.toLocaleString()}</Text>
      </View>
    </View>
  );

  const VAT = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={[styles.total, styles.total2]}>
        <Text></Text>
      </View>
      <View style={styles.tbodyTotal}>
        <Text>VAT ({vatPercentage}%)</Text>
      </View>
      <View style={styles.tbodyTotal}>
        <Text>{vatPercentage ? VAT_AMOUNT.toLocaleString() : "0"}</Text>
      </View>
    </View>
  );

  const TotalBillWithVAT = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={[styles.total, styles.total2]}>
        <Text></Text>
      </View>
      <View style={styles.tbodyTotalWithVAT}>
        <Text>TOTAL BILL</Text>
      </View>
      <View style={styles.tbodyTotalWithVAT}>
        <Text>{TOTAL_WITH_VAT.toLocaleString()}</Text>
      </View>
    </View>
  );

  const TotalBill = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={[styles.total, styles.total2]}>
        <Text></Text>
      </View>
      <View style={styles.tbodyTotalWithVAT}>
        <Text>TOTAL BILL</Text>
      </View>
      <View style={styles.tbodyTotalWithVAT}>
        <Text>{SUBTOTAL.toLocaleString()}</Text>
      </View>
    </View>
  );

  const AmountInWords = () => (
    <View style={styles.titleContainer}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Amount in words</Text>
          <Text style={[styles.quotationDetail, { flexWrap: "wrap" }]}>
            {numberToWords(TOTAL_WITH_VAT)} {currencyCodeToName(currency)}s Only
          </Text>
        </View>

        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Advance Payment</Text>
          <Text style={[styles.quotationDetail, { flexWrap: "wrap" }]}>
            {advance
              ? advance +
                "%" +
                " advance payment is required before project starts"
              : "No advance payment required"}
          </Text>
        </View>
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Payment Notes</Text>
          <Text style={[styles.quotationDetail, { flexWrap: "wrap" }]}>
            {paymentNotes ? paymentNotes : "No extra payment notes provided"}
          </Text>
        </View>
      </View>
    </View>
  );

  const Contact = () => (
    <View style={styles.titleContainer}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Bank Payment Details</Text>
          <Text style={styles.quotationDetail}>
            ACCOUNT NAME: GEOTECHNICAL ENGINEERING AND TECHNOLOGY LABORATORY
            LIMITED
          </Text>
          <Text style={styles.quotationDetail}>BANK: ABSA Bank</Text>
          <Text style={styles.quotationDetail}>
            BRANCH: Ntinda Branch, Kampala, Uganda
          </Text>
          <Text style={styles.quotationDetail}>ACCOUNT NUMBER: 6007328255</Text>
          <Text style={styles.quotationDetail}>SWIFT CODE: BARCUGKXXX</Text>
          <Text style={{ ...styles.heading, marginTop: 10 }}>Contact us</Text>
          <Text style={styles.quotationDetail}>
            If you have any questions concerning this{" "}
            {generateInvoice ? "invoice" : "quotation"}, contact Ivan Masuba on
            +256 752 972309 or email imasuba@getlab.co.ug
          </Text>
        </View>
        <View style={{ width: "48%" }}>
          <Image
            style={tw("w-[200px] mt-5")}
            src="/getlab-certifications.png"
          />
        </View>
      </View>
    </View>
  );

  const Subsection = ({ text }: any) => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.subsection}>
        <Text>{text}</Text>
      </View>
    </View>
  );

  const NoItems = ({ text }: any) => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.noItems}>
        <Text>{text}</Text>
      </View>
    </View>
  );

  const isVATRequired = () => vatPercentage > 0;

  return (
    <Page size="A4" style={styles.page}>
      <Header />
      <ClientAddressAndProject />
      <TableHead />
      <Subsection text="Mobilization & Demobilization costs" />
      <TableBodyWithListItems items={mobilization} />
      <Subsection text="Field Investigations" />
      <TableBodyWithListItems items={field} />
      <Subsection text="Laboratory tests" />
      <TableBodyWithListItems items={lab} />
      <Subsection text="Reporting" />
      <TableBodyWithListItems items={reporting} />
      <TableTotal />
      {isVATRequired() ? <VAT /> : null}
      {isVATRequired() ? <TotalBillWithVAT /> : <TotalBill />}
      <AmountInWords />
      <Contact />
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  );
};
