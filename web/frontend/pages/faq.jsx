import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function PageName() {
  return (
    <Page>
      <TitleBar
        title="Frequently Asked Questions"
      />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Heading>Why Should I Use This App?</Heading>
            <TextContainer>
              <p>With this app you can define your locals or standard clothing measurements easily. You can add size chart in your apparel store, most of the customers drop out because they are confused of their sizes, with this app , your sales will boost. Some users do returns because of wrong sizes, this app will reduce returning orders.</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>Why Should I Pay Monthly Fees?</Heading>
            <TextContainer>
              <p>Just like any other website, this app is also a website hosted on our server, we maintain the server, we constantly do tweaks and upgrades in our app to make our app robust and improve your experience with our app</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>Will there be changes in app in near future?</Heading>
            <TextContainer>
              <p>Yes! we are striving to make this app a single bundled app for you to enhance your shopify store capability. There will be much more new features from time to time.</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>Can I Use This App With Other Ecommerce Stores Other Than Apparels?</Heading>
            <TextContainer>
              <p>No! this app is only designed for apparels.</p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
