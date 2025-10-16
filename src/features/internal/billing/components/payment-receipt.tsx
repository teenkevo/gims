import React from "react";
import { Image, Text, View, Page, StyleSheet, Font } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { format } from "date-fns";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { currencyCodeToName } from "@/lib/utils";
import { numberToWords } from "../../projects/constants";
import { Payments } from "./make-payment-dialog";

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

interface PaymentReceiptProps {
  project: PROJECT_BY_ID_QUERYResult[number];
  quotation: NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>;
  payment: Payments[number];
  receiptNumber: string;
  receiptDate: string;
}

export const PaymentReceipt = ({
  project,
  quotation,
  payment,
  receiptNumber,
  receiptDate,
}: PaymentReceiptProps) => {
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
      justifyContent: "space-between",
      marginBottom: 20,
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

    receipt: { fontWeight: 400, fontSize: 20 },

    receiptNumber: {
      fontSize: 11,
      fontWeight: 400,
    },

    receiptDetail: {
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

    statusBadge: {
      backgroundColor: "#43AC33",
      color: "white",
      padding: "4px 8px",
      borderRadius: 4,
      fontSize: 8,
      fontWeight: 600,
      textAlign: "center",
    },
  });

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
        <Text style={[styles.title]}>PAYMENT RECEIPT</Text>
        <View style={tw("flex flex-row mt-9")}>
          <Text style={styles.metaTitle}>Receipt No:</Text>
          <Text style={styles.metaDescription}> {receiptNumber}</Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>Receipt Date:</Text>
          <Text style={styles.metaDescription}>
            {" "}
            {format(new Date(receiptDate), "MMM d, yyyy, h:mma")}
          </Text>
        </View>
        <View style={tw("flex flex-row")}>
          <Text style={styles.metaTitle}>For Quotation:</Text>
          <Text style={styles.metaDescription}>
            {" "}
            {quotation.quotationNumber}
          </Text>
        </View>
      </View>
    </View>
  );

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
          Payment Received From
        </Text>
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

  const PaymentDetails = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ ...styles.heading, marginBottom: 5 }}>
        Payment Details
      </Text>
      <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
        <View style={styles.theader}>
          <Text>PAYMENT TYPE</Text>
        </View>
        <View style={styles.theader}>
          <Text>AMOUNT ({payment.currency?.toUpperCase()})</Text>
        </View>
        <View style={styles.theader}>
          <Text>PAYMENT METHOD</Text>
        </View>
        <View style={styles.theader}>
          <Text>REFERENCE</Text>
        </View>
      </View>
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={styles.tbody}>
          <Text style={{ textTransform: "capitalize" }}>
            {payment.paymentType} Payment
          </Text>
        </View>
        <View style={styles.tbodyRightAlign}>
          <Text>{payment.amount?.toLocaleString()}</Text>
        </View>
        <View style={styles.tbody}>
          <Text style={{ textTransform: "capitalize" }}>
            {payment.paymentMode === "mobile"
              ? "Mobile Money"
              : payment.paymentMode === "bank"
                ? "Bank Transfer"
                : payment.paymentMode === "cash"
                  ? "Cash"
                  : "N/A"}
          </Text>
        </View>
      </View>
    </View>
  );

  const QuotationSummary = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ ...styles.heading, marginBottom: 5 }}>
        Quotation Summary
      </Text>
      <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
        <View style={styles.theader}>
          <Text>DESCRIPTION</Text>
        </View>
        <View style={styles.theader}>
          <Text>AMOUNT ({payment.currency?.toUpperCase()})</Text>
        </View>
      </View>
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={styles.tbody}>
          <Text>Total Quotation Amount</Text>
        </View>
        <View style={styles.tbodyRightAlign}>
          <Text>{quotation.grandTotal?.toLocaleString()}</Text>
        </View>
      </View>
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={styles.tbody}>
          <Text>Amount Paid</Text>
        </View>
        <View style={styles.tbodyRightAlign}>
          <Text>{payment.amount?.toLocaleString()}</Text>
        </View>
      </View>
      <View style={{ width: "100%", flexDirection: "row" }}>
        <View style={styles.tbodyTotal}>
          <Text>Remaining Balance</Text>
        </View>
        <View style={styles.tbodyTotal}>
          <Text>
            {(
              (quotation.grandTotal || 0) - (payment.amount || 0)
            ).toLocaleString()}
          </Text>
        </View>
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
          <Text style={styles.heading}>Amount Received in Words</Text>
          <Text style={[styles.receiptDetail, { flexWrap: "wrap" }]}>
            {numberToWords(payment.amount || 0)}{" "}
            {currencyCodeToName(payment.currency || "ugx")}s Only
          </Text>
        </View>
        <View style={{ width: "48%" }}>
          <Text style={styles.heading}>Contact Information</Text>
          <Text style={styles.receiptDetail}>
            For any questions regarding this receipt, contact Ivan Masuba on
            +256 752 972309 or email imasuba@getlab.co.ug
          </Text>
          <Image
            style={tw("w-[200px] mt-5")}
            src="/getlab-certifications.png"
          />
        </View>
      </View>
    </View>
  );

  return (
    <Page size="A4" style={styles.page}>
      <Header />
      <ClientAddressAndProject />
      <PaymentDetails />
      <QuotationSummary />
      <AmountInWords />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  );
};
