import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function PageName() {
  return (
    <Page>
      <TitleBar
        title="Help Section"
      />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Heading>Using This App</Heading>
            <TextContainer>
              <p>With this app you can define your locals or standard clothing measurements easily. You can add size chart in your apparel store, most of the customers drop out because they are confused of their sizes, with this app , your sales will boost. Some users do returns because of wrong sizes, this app will reduce returning orders.</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>How To Add App Widget In Your Store Front?</Heading>
            <TextContainer>
              <p>In the app dashboard, you can click on "Connect other Theme" button. In the popup window you can select the theme, on which you want to enable the widget , select the theme from dropdown and then click on "Connect Your Theme" button. For further info you can watch this video.</p>
            </TextContainer>
            <iframe width="100%" style={{marginTop:'1rem'}} height="400" src="https://www.youtube.com/embed/zzopZBOBHCo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
